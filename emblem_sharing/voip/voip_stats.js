function createStats(statsEl) { 
    let isEnabled = false;
    let peerStats = {};

    return {
        toggle(enable) {
            isEnabled = enable;
            statsEl.hidden = !enable;
            peerStats = {};
            if(isEnabled) {
                setTimeout(update, 1000);
            }
        }
    }

    async function update() {
        await displayStats();

        if(isEnabled) {
            setTimeout(update, 1000);
        }
    }

    async function getConnectionStats(pc) {
        const stats = await pc.getStats();
        
        const frame = {};
        frame.timestamp = performance.now();
        frame.outgoingBitrate = 0;
        frame.incomingBitrate = 0;
        
        stats.forEach(report => {
            if (report.type === 'inbound-rtp') {
                frame.inboundRtp = report;
            }
            else if (report.type === 'outbound-rtp') {
                frame.outboundRtp = report;
            }
            else if (report.type === 'candidate-pair') {
                frame.requestsSent = report.requestsSent;
                frame.responsesReceived = report.responsesReceived;
                frame.state = report.state;
            }
        });
        return frame;
    }

    function aggregateStats(lastFrame, frame) {
        if(!lastFrame) {
            return frame;
        }
        if(frame.outboundRtp && lastFrame.outboundRtp) {
            frame.outgoingBitrate = calculateBitrate(
            frame.outboundRtp.bytesSent,  
            lastFrame.outboundRtp.bytesSent, 
            frame.outboundRtp.timestamp,  
            lastFrame.outboundRtp.timestamp);
        }
        if(frame.inboundRtp && lastFrame.inboundRtp) {
            frame.incomingBitrate = calculateBitrate(
                frame.inboundRtp.bytesReceived,  
                lastFrame.inboundRtp.bytesReceived, 
                frame.inboundRtp.timestamp,  
                lastFrame.inboundRtp.timestamp);
        }
        return frame;
    }

    async function collectStats() {
        const peerList = Object.keys(peers);
        const connectionStats = await Promise.all(peerList.map((uid => getConnectionStats(peers[uid].connection))));
        for(let i = 0; i < peerList.length; i++) {
            const peer = peers[peerList[i]];
            const stats = aggregateStats(peerStats[peer.uid], connectionStats[i]);
            peerStats[peer.uid] = stats;
        } 
    }

    function determineIceType(sender) {
        const iceTransport = sender?.transport?.iceTransport;
        if(!iceTransport) {
            return '-';
        }
        const selectedPair = iceTransport.getSelectedCandidatePair();
        const localCandidate = selectedPair?.local?.type ?? '-';
        const remoteCandidate = selectedPair?.remote?.type ?? '-';
        return `${localCandidate} / ${remoteCandidate}`;
    }

    async function displayStats() {
        const table = document.createElement('table');
        await collectStats();

        let rows = '';
        for(const uid in peers) {
            const peer = peers[uid];
            const stats = peerStats[uid];
            const row = `
                <tr>
                    <td>${escapeHtml(uid)}</td>
                    <td>${peer.connection.connectionState}</td>
                    <td>${peer.connection.iceConnectionState}</td>
                    <td>${determineIceType(peer.sender)}</td>
                    <td>${formatBitrate(stats.outgoingBitrate)}</td>
                    <td>${formatBitrate(stats.incomingBitrate)}</td>
                    <td>${stats.outboundRtp?.packetsSent ?? 0}</td>
                    <td>${stats.inboundRtp?.packetsReceived ?? 0}</td>
                    <td>${stats.inboundRtp?.packetsLost ?? 0}</td>
                </tr>
            `;
            rows += row;
        }

        const html = /*html*/`
            <table>
                <thead>
                    <tr>
                        <th>User</th>
                        <th>Connection State</th>
                        <th>Ice State</th>
                        <th>Ice Type</th>
                        <th>Out Bitrate</th>
                        <th>In Bitrate</th>
                        <th>Packets Sent</th> 
                        <th>Packets Recv</th> 
                        <th>Packets Lost</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </body>
            </table>
        `   
        table.innerHTML = html;
        statsEl.replaceChildren(table);
      }

      function calculateBitrate(currentbytes, prevBytes, currentTimestamp, prevTimestamp) {
        if(currentTimestamp === prevTimestamp) {
            return 0;
        }
        const dt = (currentTimestamp - prevTimestamp) / 1000.0;
        return Math.round((currentbytes - prevBytes) * 8 / dt);
      }


      function formatBitrate(bitrate) {
        if (bitrate >= 1000000000) {
            return (bitrate / 1000000000).toFixed(2) + ' Gbps';
        } else if (bitrate >= 1000000) {
            return (bitrate / 1000000).toFixed(2) + ' Mbps';
        } else if (bitrate >= 1000) {
            return (bitrate / 1000).toFixed(2) + ' kbps';
        } else {
            return bitrate.toFixed(2) + ' bps';
        }
    }

    function escapeHtml(str) {
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }
}

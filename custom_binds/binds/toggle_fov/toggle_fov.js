let defaultFov = 100;

dew.on('show', async function (event) {
    dew.command("Camera.FOV").then(function(fov) {
        dew.command("Camera.FOV " + (fov.split(".")[0] == "55" ? defaultFov : "55"));
    });
    dew.hide();
});
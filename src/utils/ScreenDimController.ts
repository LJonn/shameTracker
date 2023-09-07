class ScreenDimController {
    private wakeLock: WakeLockSentinel | null = null;

    async disableScreenDim() {
        if (this.wakeLock) {
            console.log("Screen dimming already disabled.");
        } else
            try {
                this.wakeLock = await navigator.wakeLock.request("screen");
                console.log("Screen dimming disabled.");
            } catch (error) {
                console.error("Failed to disable screen dimming:", error);
            }
    }

    async enableScreenDim() {
        if (this.wakeLock) {
            try {
                await this.wakeLock.release();
                this.wakeLock = null;
                console.log("Screen dimming enabled.");
            } catch (error) {
                console.error("Failed to enable screen dimming:", error);
            }
        } else {
            console.warn("Screen dimming is not currently disabled.");
        }
    }
}
export default new ScreenDimController();

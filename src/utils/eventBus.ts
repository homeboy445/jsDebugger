
class EventBus {
    eventStore: { [eventName: string]: Array<(...args: any) => void>; } = {};
    on(event: string, callback: (...args: any[]) => void): void {
        this.eventStore[event] = this.eventStore[event] || [];
        this.eventStore[event].push(callback);
    }
    off(event: string): void {
        delete this.eventStore[event];
    }
    trigger(event: string, data: any): void {
        for (let i = 0; i < (this.eventStore[event]?.length || 0); i++) {
            this.eventStore[event][i](data);
        }
    }
}

export default new EventBus();

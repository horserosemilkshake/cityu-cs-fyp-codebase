export var cookie: string[] | undefined;
export function setCookie(c: string[] | undefined) {
    cookie = c;
}
export let timerId: NodeJS.Timeout | undefined = undefined;
export function setTimerId(c: NodeJS.Timeout | undefined) {
    timerId = c;
}
export function getTimerId() {
    return timerId;
}
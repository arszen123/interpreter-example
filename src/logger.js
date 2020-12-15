import log from 'loglevel';

const silent = () => log.disableAll();
const noisy = () => log.enableAll();
export {
    log,
    silent,
    noisy,
}
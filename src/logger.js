import logger from 'loglevel';

logger.setDefaultLevel('silent');
logger.setLevel('silent');

const scope = logger.getLogger('scope');
const stack = logger.getLogger('stack');

export {
    scope,
    stack,
};

export default {
    scope,
    stack,
};
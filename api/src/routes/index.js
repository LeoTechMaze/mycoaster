const { Router } = require('express');

const router = Router();

router.use('/auth',  require('./auth'));
router.use('/users', require('./users'));

// Phase 1 routes — uncomment as each module is implemented
router.use('/parks',    require('./parks'));
router.use('/coasters', require('./coasters'));
// router.use('/credits',  require('./credits'));
// router.use('/reviews',  require('./reviews'));

module.exports = router;

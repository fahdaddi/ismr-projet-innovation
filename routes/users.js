var express = require('express');
var router = express.Router();

//home Page
router.get('/',(req,res,next)=>{
  res.send('users');
});
module.exports = router;

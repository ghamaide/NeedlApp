'use strict';

let conf = {};

if (__DEV__) {
  //conf.API = 'http://localhost:3000';
  conf.API = 'http://www.needl.fr';
} else {
  conf.API = 'http://www.needl.fr';
}

export default conf;

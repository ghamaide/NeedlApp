'use strict';

let conf = {};

if (__DEV__) {
  // conf.API = 'http://192.168.1.65:3000';
  conf.API = 'http://www.needl.fr';
} else {
  conf.API = 'http://www.needl.fr';
}

export default conf;

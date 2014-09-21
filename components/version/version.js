'use strict';

angular.module('AdnGallery.version', [
  'AdnGallery.version.interpolate-filter',
  'AdnGallery.version.version-directive'
])

.value('version', '0.1');

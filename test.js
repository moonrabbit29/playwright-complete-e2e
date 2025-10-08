sample_apps = require('sample-apps');

apps = sample_apps.list();

console.log(apps);
//[ 'ApiDemos-debug',
//  'UICatalog7.1',
//  'ContactManager-selendroid',
//  'ContactManager',
//  'TestApp',
//  'TestApp6.0',
//  'TestApp6.1',
//  'TestApp7.1',
//  'UICatalog6.0',
//  'UICatalog6.1',
//  'WebViewApp6.0',
//  'WebViewApp6.1',
//  'WebViewApp7.1' ]

pathToApiDemos = sample_apps('ApiDemos-debug');
console.log(pathToApiDemos)
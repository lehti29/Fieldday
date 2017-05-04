# FieldDay
Project for course DM2518 @ KTH

## Run in browser
cordova requirements says that it doesn't have browser, but that is false for me. Just open it anyway (if something pops up to install your default browser, you can ignore it. just open the address anyway).
"cordova build browser && cordova run browser"

## Install stuff
install cordova using "npm install -g cordova"

Check requirements using "cordova requirements"

If your platforms and plugins folder got deleted (we don't track them), use the command "cordova prepare" which loads data from config.xml and installs the stuff we need, as long as someone installed them with the "--save" flag.

### OSX
#### Android dev tools
Download dev-tools from [developer-android](https://developer.android.com/studio/index.html), they are at the bottom unless you want entire android studio.

#### IOS
Install XCode from AppStore. Install the deploy-thing with command "npm install -g ios-deploy".

#### Cocoapods
"brew install cocoapods"

"pod setup"
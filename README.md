# voyent.notify.js

Voyent.notify.js is a client library for displaying, managing and injecting notification data sent by Voyent services.

## Compatible Platforms
Tested on Chrome, Firefox and Safari.

## Dependencies
 
[bridgeit.js](https://github.com/bridgeit/bridgeit.js)  
[bridgeit.io.js](https://github.com/bridgeit/bridgeit.io.js)  
[bridgeit.xio.js](https://github.com/bridgeit/bridgeit.xio.js)  

## Getting Started

1. Get the basic dependencies manually or with Bower: 

```
"dependencies": {
	"voyent.notify.js": "https://github.com/voyent/voyent.notify.js.git#master"
}
```

2. Import the dependencies:

```
<script src="../bower_components/voyent.notify.js/bower_components/bridgeit.js/lib/bridgeit.js"></script>
<script src="../bower_components/voyent.notify.js/bower_components/bridgeit.io.js/lib/bridgeit.io.js"></script>
<script src="../bower_components/voyent.notify.js/bower_components/bridgeit.xio.js/lib/bridgeit.xio.js"></script>
```

3. Import the library and dependencies: 

```
<script src="../bower_components/voyent.notify.js/lib/voyent.notify.js"></script>
```

4. Establish a connection to the push service: 

```
bridgeit.xio.push.attach('http://'+app.host+'/pushio/demos/realms/' + bridgeit.io.auth.getLastKnownRealm(), bridgeit.io.auth.getLastKnownUsername());
```

5. Join desired push groups:

```
bridgeit.xio.push.join("/demos/realms/" + bridgeit.io.auth.getLastKnownRealm() + "/" + bridgeit.io.auth.getLastKnownUsername());
```

## API Reference

* [Properties](#properties)
    * [Readonly](#readonly)
        * [payload](#payload)
        * [metadata](#metadata)
        * [queue](#queue)
    * [General Notification Config](#generalConfig)
        * [title](#title)
        * [icon](#icon)
        * [hideAfterClick](#hideAfterClick)
    * [Toast Notification Config](#toastConfig)
        * [enabled](#toastEnabled)
        * [hideAfterMs](#toastHideAfterMs)
        * [stackLimit](#stackLimit)
        * [overwriteOld](#overwriteOld)
        * [position](#position)
        * [spacing](#spacing)
        * [style](#style)
        * [close.enabled](#closeEnabled)
        * [close.style](#closeStyle)
    * [Native Notification Config](#nativeConfig)
        * [enabled](#nativeEnabled)
        * [hideAfterMs](#nativeHideAfterMs)

* [Functions](#functions)
    * [General](#generalFunctions)
        * [startListening](#startListening)
        * [stopListening](#stopListening)
    * [Notification Management](#notificationManagement)
        * [redirectToNotification](#redirectToNotification)
        * [hideNotification](#hideNotification)
        * [getCurrentNotification](#getCurrentNotification)
        * [removeCurrentNotification](#removeCurrentNotification)
        * [injectNotificationData](#injectNotificationData)
        * [clearInjectedNotificationData](#clearInjectedNotificationData)
        * [setCurrentNotification](#setCurrentNotification)
    * [Queue Management](#queueManagement)
        * [getNotificationCount](#getNotificationCount)
        * [getNotificationAt](#getNotificationAt)
        * [getNextNotification](#getNextNotification)
        * [getPreviousNotification](#getPreviousNotification)
        * [getNewestNotification](#getNewestNotification)
        * [getOldestNotification](#getOldestNotification)
        * [removeNotification](#removeNotification)
        * [removeNotificationAt](#removeNotificationAt)
        * [clearNotificationQueue](#clearNotificationQueue)
    
* [Events](#events)
    * [voyentNotifyInitialized](#voyentNotifyInitialized)
    * [beforeQueueUpdated](#beforeQueueUpdated)
    * [afterQueueUpdated](#afterQueueUpdated)
    * [beforeDisplayNotification](#beforeDisplayNotification)
    * [afterDisplayNotification](#afterDisplayNotification)
    * [currentNotificationSet](#currentNotificationSet)
    * [notificationClicked](#notificationClicked)
    * [notificationClosed](#notificationClosed)

- - -

<a name="properties"></a>
### Properties

<a name="readonly"></a>
#### Readonly

| Property                         | Description                            | Type     | Default |
| -------------------------------- | -------------------------------------- | -------- | ------- |
| <a name="payload"></a> payload   | The current notification payload.      | Object   | null    |
| <a name="metadata"></a> metadata | The current notification metadata.     | Object   | null    |
| <a name="queue"></a> queue       | The notification queue.                | Object[] | []      |

**Example**  
```js
var currentPayload = voyent.notify.payload;
var currentMeta = voyent.notify.metadata;
var queue = voyent.notify.queue;
```

<a name="generalConfig"></a>
#### General Notification Config (config.)

| Property                                     | Description                                                                                   | Type     | Default |
| -------------------------------------------- | --------------------------------------------------------------------------------------------- | -------- | ------- |
| <a name="title"></a> title                   | Title/header text for each notification.                                                      | String   | ''      |
| <a name="icon"></a> icon                     | The URL of the image to use as an icon for Toast and Native notifications. Max-width of 40px. | String   | ''      |
| <a name="hideAfterClick"></a> hideAfterClick | Indicates if the notification should be hidden after clicking on it.                          | Boolean  | true    |

**Example**  
```js
voyent.notify.config.title = 'New Voyent Notification';
voyent.notify.config.icon = 'http://url-to-icon/img.png';
voyent.notify.config.hideAfterClick = 'false';
```

<a name="toastConfig"></a>
#### Toast Notification Config (config.toast.)

| Property                                        | Description                                                                                                                       | Type    | Default     |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------- | ----------- |
| <a name="toastEnabled"></a> enabled             | Indicates if toast notifications should be shown.                                                                                 | Boolean | true        |
| <a name="toastHideAfterMs"></a> hideAfterMs     | Time in milliseconds that the notification will be automatically hidden after shown (specify <=0 to never hide the notification). | Integer | 5000        |
| <a name="stackLimit"></a> stackLimit            | Indicates the number of notifications that will be allowed to stack (specify <=0 to have no limit).                               | Integer | 3           |
| <a name="overwriteOld"></a> overwriteOld        | Indicates if new toast notifications should overwrite/replace old ones in the stack.                                              | Boolean | false       |
| <a name="position"></a> position                | Position of toast notifications on page. One of 'top-right','top-left','bottom-right','bottom-left'.                              | String  | 'top-right' |
| <a name="spacing"></a> spacing                  | Number of pixels that the toast notifications should be spaced apart.                                                             | Integer | 2           |
| <a name="style"></a> style                      | Custom styling for the toast notification container.                                                                              | String  | ''          |
| <a name="closeEnabled"></a> close.enabled       | Indicates if the close button should be shown for toast notifications.                                                            | Boolean | true        |
| <a name="closeStyle"></a> close.style           | Custom styling for the toast notification close container.                                                                        | String  | ''          |

**Example**  
```js
voyent.notify.config.toast.stackLimit = 8;
voyent.notify.config.toast.position = 'bottom-left';
voyent.notify.config.toast.style = 'background-color:black;';
voyent.notify.config.toast.close.style = 'color:red;';
```

<a name="nativeConfig"></a>
#### Native Notification Config (config.native.)

| Property                                     | Description                                                                                                                       | Type    | Default |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------- | ------- |
| <a name="nativeEnabled"></a> enabled         | Indicates if native notifications should be enabled (still must be allowed by user in browser).                                   | Boolean | true    |
| <a name="nativeHideAfterMs"></a> hideAfterMs | Time in milliseconds that the notification will be automatically hidden after shown (specify <=0 to never hide the notification). | Integer | -1      |
 
**Example**  
```js
voyent.notify.config.native.hideAfterMs = 5000;
```

- - -

<a name="functions"></a>
### Functions

<a name="generalFunctions"></a>
#### General 

<a name="startListening"></a>
##### startListening()
Start listening for notifications.

**Example**  
```js
voyent.notify.startListening();
```

<a name="stopListening"></a>
##### stopListening()
Stop listening for notifications.

**Example**  
```js
voyent.notify.stopListening();
```

<a name="notificationManagement"></a>
#### Notification Management

<a name="redirectToNotification"></a>
##### redirectToNotification(notification)
Redirects the browser to the URL specified in the metadata of the passed notification and injects the notification data into the page.

| Param        | Description                                         | Type   |
| ------------ | --------------------------------------------------- | ------ |
| notification | The notification that determines where to redirect. | Object |

**Example**  
```js
var redirectTo = voyent.notify.getNextNotification();
voyent.notify.redirectToNotification(redirectTo);
```

<a name="hideNotification"></a>
##### hideNotification(notification,ms)
Manually hides a notification.

| Param        | Description                                                        | Type    |
| ------------ | ------------------------------------------------------------------ | ------- |
| notification | A Toast or Native notification reference.                          | Object  |
| ms           | The number of milliseconds to wait before hiding the notification. | Integer |

**Example**  
```js
//selectively hide notifications
voyent.notify.config.toast.hideAfterMs = -1;
voyent.notify.config.native.hideAfterMs = -1;
document.addEventListener('afterDisplayNotification',function(e) {
    if (e.detail.notification.payload.hidable) {
        voyent.notify.hideNotification(e.detail.toast ? e.detail.toast : e.detail.native,0);
    }
});
```

<a name="getCurrentNotification"></a>
##### getCurrentNotification()
Returns the currently active notification or null if there is no current notification.  
**Returns:** Object - The notification.

**Example**  
```js
var currentNotification = voyent.notify.getCurrentNotification();
```

<a name="removeCurrentNotification"></a>
##### removeCurrentNotification()
Removes the currently active notification.  
**Returns:** Boolean - Indicates if the notification was removed successfully.

**Example**  
```js
if (voyent.notify.removeCurrentNotification()) {
    console.log('Notification removed successfully!');
}
```

<a name="injectNotificationData"></a>
##### injectNotificationData()
Injects the current notification into elements with data-payload-* and data-metadata-* attributes. 
Currently has special support for input and select elements. 
For all other elements the data will be inserted as text content.

**Example**  
```js
voyent.notify.injectNotificationData();
```

<a name="clearInjectedNotificationData"></a>
##### clearInjectedNotificationData()
Removes all injected notification data from the page.

**Example**  
```js
voyent.notify.clearInjectedNotificationData();
```

<a name="setCurrentNotification"></a>
##### setCurrentNotification(notification)
Sets the current notification to the one passed if it is a valid notification in the queue.
**Returns:** Boolean - Indicates if the notification was set successfully.

| Param        | Description                        | Type   |
| ------------ | ---------------------------------- | ------ |
| notification | The notification object to be set. | Object |

**Example**  
```js
voyent.notify.setCurrentNotification(voyent.notify.getNextNotification());
```

<a name="queueManagement"></a>
#### Queue Management

<a name="getNotificationCount"></a>
##### getNotificationCount()
Returns an integer that represents the number of notifications currently in the queue.
**Returns:** Integer - The notification count.

**Example**  
```js
console.log('Currently there are',voyent.notify.getNotificationCount(),'notifications in the queue');
```

<a name="getNotificationAt"></a>
##### getNotificationAt(index)
Returns the notification at the specified index or null if none was found.
**Returns:** Object - The notification.

| Param        | Description                                 | Type    |
| ------------ | ------------------------------------------- | ------- |
| index        | The index of the notification in the queue. | Integer |

**Example**  
```js
var fourthNotification = voyent.notify.getNotificationAt(3);
```

<a name="getNextNotification"></a>
##### getNextNotification()
Returns the next notification in the queue or null if none was found.
**Returns:** Object - The notification.

**Example**  
```js
var nextNotification = voyent.notify.getNextNotification();
```

<a name="getPreviousNotification"></a>
##### getPreviousNotification()
Returns the previous notification in the queue or a null if none was found.
**Returns:** Object - The notification.

**Example**  
```js
var previousNotification = voyent.notify.getPreviousNotification();
```

<a name="getNewestNotification"></a>
##### getNewestNotification()
Returns the newest notification that is currently in the queue or null if the queue is empty.
**Returns:** Object - The notification.

**Example**  
```js
var newestNotification = voyent.notify.getNewestNotification();
```

<a name="getOldestNotification"></a>
##### getOldestNotification()
Returns the oldest notification that is currently in the queue or null if the queue is empty.
**Returns:** Object - The notification.

**Example**  
```js
var oldestNotification = voyent.notify.getOldestNotification();
```

<a name="removeNotification"></a>
##### removeNotification(notification)
Removes the specified notification from the queue.
**Returns:** Boolean - Indicates if the notification was removed successfully.

| Param        | Description                     | Type   |
| ------------ | ------------------------------- | ------ |
| notification | The notification to be removed. | Object |

**Example**  
```js
voyent.notify.removeNotification(voyent.notify.getOldestNotification());
```

<a name="removeNotificationAt"></a>
##### removeNotificationAt(index)
Removes the notification from the queue at the specified index.
**Returns:** Boolean - Indicates if the notification was removed successfully.

| Param        | Description                          | Type    |
| ------------ | ------------------------------------ | ------- |
| index | The index of the notification in the queue. | Integer |

**Example**  
```js
voyent.notify.removeNotificationAt(1);
```

<a name="clearNotificationQueue"></a>
##### clearNotificationQueue()
Removes all notifications from the notification queue.

**Example**  
```js
voyent.notify.clearNotificationQueue();
```


<a name="events"></a>
### Events

<a name="voyentNotifyInitialized"></a>
##### voyentNotifyInitialized
Fired after the library is initialized and listening for new notifications. Only fires on initial load.  
**Cancelable:** false

| Param  | Description                  | Type    |
| ------ | ---------------------------- | ------- |
| config | The current config settings. | Object  |

**Example**  
```js
//set the desired default config
document.addEventListener('voyentNotifyInitialized',function(e) {
    e.detail.config.toast.enabled = false;
});
```

<a name="beforeQueueUpdated"></a>
##### beforeQueueUpdated
Fired before the queue is updated. An update will be triggered when loading a queue from storage or adding, removing or clearing the queue. Cancel the event to prevent the operation.  
**Cancelable:** true

| Param        | Description                                                                                                                     | Type     |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------- | -------- |
| op           | The operation being performed on the queue. One of 'add','del','clear',load'. Load indicates the queue was loaded from storage. | String   |
| notification | The notification being added or removed (only provided if op = 'add' or 'del').                                                 | Object   |
| queue        | The queue before the operation is performed.                                                                                    | Object[] |

**Example**  
```js
//prevent certain notifications from being added to queue 
document.addEventListener('beforeQueueUpdated',function(e) {
    if (e.detail.op === 'add') {
        if (e.detail.notification.payload.throwaway) {
            e.preventDefault();
        }
    }
});
```

<a name="afterQueueUpdated"></a>
##### afterQueueUpdated
Fired after the queue is updated.  
**Cancelable:** false

| Param  | Description                                      | Type     |
| ------ | ------------------------------------------------ | -------- |
| queue | The queue after an update operation.              | Object[] |

**Example**  
```js
//keep app-level data in sync with library
document.addEventListener('afterQueueUpdated',function(e) {
    appQueue = e.detail.queue;
    appNotificationCount = voyent.notify.getNotificationCount());
});
```

<a name="beforeDisplayNotification"></a>
##### beforeDisplayNotification
Fired before a notification is displayed. Fires for both Toast and Native notifications. Cancel the event to prevent the notification from being displayed.    
**Cancelable:** true

| Param        | Description                                    | Type    |
| ------------ | ---------------------------------------------- | ------- |
| notification | The notification that will be displayed.       | Object  |

**Example**  
```js
//prevent notifications from being displayed based on some criteria
document.addEventListener('beforeDisplayNotification',function(e) {
    if (e.detail.notification.metadata.desc.indexOf('debug') > -1) {
        e.preventDefault();
    }
});
```

<a name="afterDisplayNotification"></a>
##### afterDisplayNotification
Fired after a notification is displayed. Fires for both Toast and Native notifications.    
**Cancelable:** false

| Param        | Description                                                                        | Type   |
| ------------ | ---------------------------------------------------------------------------------- | ------ |
| notification | The notification that was just displayed.                                          | Object |
| toast        | The toast DOM element. Provided if the notification displayed was toast.           | Object |
| native       | The native Notification object. Provided if the notification displayed was native. | Object |

**Example**  
```js
//change the message text for specific notifications
document.addEventListener('afterDisplayNotification',function(e) {
    var toast = e.detail.toast;
    if (toast && e.detail.notification.payload.priority === 5) {
        var messageDiv = toast.querySelector('.message');
        messageDiv.setAttribute('style',messageDiv.getAttribute('style')+'color:red;font-weight:bold;');
    }
});
```

<a name="currentNotificationSet"></a>
##### currentNotificationSet
Fired after the current notification is set.
**Cancelable:** false

| Param        | Description                         | Type   |
| ------------ | ----------------------------------- | ------ |
| notification | The notification that was just set. | Object |

**Example**  
```js
//custom app handling each time the current notification is set
document.addEventListener('currentNotificationSet',function(e) {
    myApp.processNotification();
});
```

<a name="notificationClicked"></a>
##### notificationClicked
Fired when a notification is clicked. Fires for both Toast and Native notifications. Cancel the event to prevent the app from redirecting and the notification from closing (if hideAfterClick is true).    
**Cancelable:** true

| Param        | Description                                                                      | Type   |
| ------------ | -------------------------------------------------------------------------------- | ------ |
| notification | The notification that was just clicked.                                          | Object |
| toast        | The toast DOM element. Provided if the notification clicked was toast.           | Object |
| native       | The native Notification object. Provided if the notification clicked was native. | Object |

**Example**  
```js
//prevent redirection in specific cases
document.addEventListener('notificationClicked',function(e) {
    if (myApp.currentUser.isAdmin) {
        e.preventDefault();
        voyent.notify.hideNotification(e.detail.toast ? e.detail.toast : e.detail.native,0);
    }
});
```

<a name="notificationClosed"></a>
##### notificationClosed
Fired when a notification is closed. Fires for both Toast and Native notifications. Cancel the event to prevent the notification from closing automatically (toast notifications only).  
**Cancelable:** true

| Param        | Description                                                                          | Type   |
| ------------ | ------------------------------------------------------------------------------------ | ------ |
| notification | The notification being closed.                                                       | Object |
| toast        | The toast DOM element. Provided if the notification being closed is toast.           | Object |
| native       | The native Notification object. Provided if the notification being closed is native. | Object |

**Example**  
```js
//prevent specific notifications from being closed
document.addEventListener('notificationClosed',function(e) {
    if (e.detail.notification.payload.persist) {
        e.preventDefault();
    }
});
```
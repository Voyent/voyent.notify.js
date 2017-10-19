# voyent.notify.js

Voyent.notify.js is a client library for displaying and interacting with notifications received from the Voyent Push
Service. The library provides functions for managing push groups, displaying notifications, managing the notification
queue and injecting notification data into web pages. Some notable features of the library include:

* **Browser Native Notifications**: When the library is included in your application you will automatically be prompted 
to allow browser native notifications. Browser native notifications are based on the Web Notifications API. If permission
is allowed then the library will use them as the default unless they are blocked or disabled in the future.

* **Toast Notifications**: If browser native notifications are not allowed or are disabled then the built-in toast notifications 
will be used. Toast notifications support options such as stacking, positioning, hide timeouts, styling customization, 
and more...

* **Notification Redirection**: By default, clicking on notifications in the application automatically navigates the user to
the URL specified in the Notification. After navigation the notification data will automatically be injected into the page.

* **Notification Injection**: A simple syntax is used that makes it easy to inject data from notifications into the view of your
application. For more information on this see [Notification Injection](#notificationInjection).

* **Queue Management**: Notifications are automatically added to the queue when they are received. Each one can be loaded
from the queue and removed when they are no longer needed.

* **Persistent Queue**: The notification queue is stored in the session and will survive app refreshes or redirects.


## Compatible Platforms
Tested on Chrome, Firefox and Safari.

## Dependencies
 
[voyent.js](https://github.com/voyent/voyent.js/tree/VRAS)  

## Getting Started

1) Load the library manually or with Bower: 

```
"dependencies": {
	"voyent.notify.js": "https://github.com/voyent/voyent.notify.js.git#VRAS"
}
```

2) Import the dependency:

```
<script src="../bower_components/voyent.notify.js/bower_components/voyent.js/build/dist/voyent.js"></script>
```

3) Import the library: 

```
<link rel="import" href="bower_components/voyent.notify.js/voyent.notify.html">
```

4) Call the [initialize](#initialize) function after setting up listeners

<a name="notificationInjection"></a>
## Notification Injection

Voyent.notify.js provides a function ([injectNotificationData](#injectNotificationData)) for automatically injecting
data from a notification into an application. In order for this to work the app markup must use HTML data properties
on elements that they want to inject the data on. The data property names define which data should be injected. The data
is simply copied into the view, it remains stored in the library at all times.

The data properties should be named as data-selected-* where the * represents the name of the property in the
notification that should be injected. Injection works for nested properties as well (eg. data-selected-payload-foo).
 
Notification injection occurs in the following cases:  

1) When a browser notification is received and the app is currently on the page indicated in the URL of the notification and no notification is selected.  

2) After returning to the application to act on a notification received on a non-browser transport (cloud notification, email, sms).  

3) After a notification is clicked and the app redirects to the relevant notification page.  

4) [redirectToNotification](#redirectToNotification) is called manually.

**Example** 
```html
<!-- HTML Snippet (Before Injection) -->
<span data-selected-details></span>
<input data-selected-payload-editableText />
<select data-selected-payload-simpleList></span>
<select data-selected-payload-complexList></span>
```
```js
//Sample Notification
{
   "subject":"Notification Test",
   "details":"Testing 1, 2, 3",
   "url":"http://dev.voyent.cloud/test/",
   "icon":"http://dev.voyent.cloud/test/icon",
   "priority":"info",
   "expire_time":4320,
   "payload":{
      "editableText":"Some editable text",
      "simpleList":[ "1", "2", "3" ],
      "complexList":[
         { "label":"List Item One", "value":"1" },
         { "label":"List Item Two", "value":"2" },
         { "label":"List Item Three", "value":"3" }
      ]
   },
   "time":"2016-06-07T23:37:08.694Z",
   "group":"jennifer.rene",
   "sender":"admin.user"
}
```
```html
<!-- HTML Snippet (After Injection) -->
<span data-selected-details>Testing 1, 2, 3</span>
<input data-selected-payload-editableText value="Some editable text"/>
<select data-selected-payload-simpleList>
    <option value="1">1</option>
    <option value="2">2</option>
    <option value="3">3</option>
</select>
<select data-selected-payload-complexList>
    <option value="1">List Item One</option>
    <option value="2">List Item Two</option>
    <option value="3">List Item Three</option>
</select>
```


## API Reference

* [Properties](#properties)
    * [Readonly](#readonly)
        * [groups](#groups)
        * [selected](#selected)
        * [queue](#queue)
        * [queuePosition](#queuePosition)
    * [General Config](#generalConfig)
        * [autoSelectNotification](#autoSelectNotification)
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
    * [Browser Native Notification Config](#nativeConfig)
        * [enabled](#nativeEnabled)
        * [hideAfterMs](#nativeHideAfterMs)

* [Functions](#functions)
    * [General](#generalFunctions)
        * [initialize](#initialize)
        * [startListening](#startListening)
        * [stopListening](#stopListening)
        * [joinGroup](#joinGroup)
        * [leaveGroup](#leaveGroup)
    * [Notification Management](#notificationManagement)
        * [redirectToNotification](#redirectToNotification)
        * [displayNotification](#displayNotification)
        * [hideNotification](#hideNotification)
        * [removeSelectedNotification](#removeSelectedNotification)
        * [injectNotificationData](#injectNotificationData)
        * [clearInjectedNotificationData](#clearInjectedNotificationData)
        * [selectNotification](#selectNotification)
        * [selectNotificationAt](#selectNotificationAt)
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
    * [notificationReceived](#notificationReceived)
    * [beforeQueueUpdated](#beforeQueueUpdated)
    * [afterQueueUpdated](#afterQueueUpdated)
    * [beforeDisplayNotification](#beforeDisplayNotification)
    * [afterDisplayNotification](#afterDisplayNotification)
    * [notificationChanged](#notificationChanged)
    * [notificationClicked](#notificationClicked)
    * [notificationClosed](#notificationClosed)

- - -

<a name="properties"></a>
### Properties

<a name="readonly"></a>
#### Readonly

| Property                                         | Description                                                                  | Type     | Default            |
| ------------------------------------------------ | ---------------------------------------------------------------------------- | -------- | ------------------ |
| <a name="groups"></a> groups                     | The groups currently registered for notifications.                           | String[] | ["currentUsername"]|
| <a name="selected"></a> selected                 | The selected notification.                                                   | Object   | null               |
| <a name="queue"></a> queue                       | The notification queue. New notifications are added to the end of the queue. | Object[] | []                 |
| <a name="queuePosition"></a> queuePosition       | The zero-based index of the selected notification in the queue.              | Integer  | -1                 |

**Example**  
```js
var selectedNotification = voyent.notify.selected;
var queue = voyent.notify.queue;
```

<a name="generalConfig"></a>
#### General Config (config.)

| Property                                                     | Description                                                                                                                                                                                     | Type    | Default    |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ---------- |
| <a name="autoSelectNotification"></a> autoSelectNotification | Provides options for auto selecting notifications so that each time a selected notification is removed a new one is selected.  One of 'disabled','oldest','newest'.                             | String  | 'disabled' |
| <a name="hideAfterClick"></a> hideAfterClick                 | Indicates if notifications should be hidden after clicking on them.                                                                                                                             | Boolean | true       |

**Example**  
```js
voyent.notify.config.autoSelectNotification = 'oldest';
voyent.notify.config.hideAfterClick = 'false';
```

<a name="toastConfig"></a>
#### Toast Notification Config (config.toast.)

| Property                                        | Description                                                                                                                                                                   | Type    | Default     |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ----------- |
| <a name="toastEnabled"></a> enabled             | Indicates if toast notifications should be shown.                                                                                                                             | Boolean | true        |
| <a name="toastHideAfterMs"></a> hideAfterMs     | Time in milliseconds that the notification will be automatically hidden after shown (specify <=0 to never hide the notification, making the toast closable only by clicking). | Integer | 5000        |
| <a name="stackLimit"></a> stackLimit            | Indicates the number of notifications that will be allowed to stack (specify <=0 to have no limit).                                                                           | Integer | 3           |
| <a name="overwriteOld"></a> overwriteOld        | Indicates if new toast notifications should overwrite/replace old ones in the stack.                                                                                          | Boolean | false       |
| <a name="position"></a> position                | Position of toast notifications on page. One of 'top-right','top-left','bottom-right','bottom-left'.                                                                          | String  | 'top-right' |
| <a name="spacing"></a> spacing                  | Number of pixels that the toast notifications should be spaced apart.                                                                                                         | Integer | 2           |
| <a name="style"></a> style                      | Custom styling that is applied to the top-level toast notification container. Any styling defined here will override the defaults.                                            | String  | ''          |
| <a name="closeEnabled"></a> close.enabled       | Indicates if the close button should be shown for toast notifications.                                                                                                        | Boolean | true        |
| <a name="closeStyle"></a> close.style           | Custom styling that is applied to the toast notification close container. Any styling defined here will override the defaults.                                                | String  | ''          |

**Example**  
```js
voyent.notify.config.toast.stackLimit = 8;
voyent.notify.config.toast.position = 'bottom-left';
voyent.notify.config.toast.style = 'background-color:black;';
voyent.notify.config.toast.close.style = 'color:red;';
```

<a name="nativeConfig"></a>
#### Browser Native Notification Config (config.native.)

| Property                                     | Description                                                                                                                       | Type    | Default |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------- | ------- |
| <a name="nativeEnabled"></a> enabled         | Indicates if browser native notifications should be enabled (still must be allowed by user in browser).                           | Boolean | true    |
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

<a name="initialize"></a>
##### initialize()
Initialize the library. This function MUST be called to enable the library. The initialization process may fire various events
so we always suggest calling this after you setup any listeners of interest. Can be triggered before or after logging in.

**Example**  
```js
voyent.notify.initialize();
```

<a name="startListening"></a>
##### startListening()
Start listening for notifications. This function is called automatically when the library is initialized and a user is logged
in via voyent.js. This function only needs to be called manually after [stopListening](#stopListening) has been called.

**Example**  
```js
voyent.notify.startListening();
```

<a name="stopListening"></a>
##### stopListening()
Stop listening for notifications for all groups currently joined. No new notifications will be received by the library
after calling this function but the other features of the library will still be available.

**Example**  
```js
voyent.notify.stopListening();
```

<a name="joinGroup"></a>
##### joinGroup(group)
Registers a new push listener for the specified group.

**Example**  
```js
voyent.notify.joinGroup('dev-team');
```

<a name="leaveGroup"></a>
##### leaveGroup(group)
Removes the registered push listener for the specified group.

**Example**  
```js
voyent.notify.leaveGroup('dev-team');
```

<a name="notificationManagement"></a>
#### Notification Management

<a name="redirectToNotification"></a>
##### redirectToNotification(notification)
Redirects the browser to the URL specified in the passed notification and injects the notification data into the page.

| Param        | Description                                         | Type   |
| ------------ | --------------------------------------------------- | ------ |
| notification | The notification that determines where to redirect. | Object |

**Example**  
```js
var redirectTo = voyent.notify.getNextNotification();
voyent.notify.redirectToNotification(redirectTo);
```

<a name="displayNotification"></a>
##### displayNotification(notification)
Displays the passed notification as a toast or browser native notification, depending on the current configuration. Can
be used to re-display a notification from the queue or even to display a custom notification that is not part of the
queue.

| Param        | Description                                                        | Type    |
| ------------ | ------------------------------------------------------------------ | ------- |
| notification | The notification object to be displayed.                           | Object  |

**Example**  
```js
//re-display the last notification in the queue
voyent.notify.displayNotification(voyent.notify.getNewestNotification());
```

<a name="hideNotification"></a>
##### hideNotification(notification,ms)
Manually hides a notification.

| Param        | Description                                                        | Type    |
| ------------ | ------------------------------------------------------------------ | ------- |
| notification | A toast or browser native notification reference.                  | Object  |
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

<a name="removeSelectedNotification"></a>
##### removeSelectedNotification()
Removes the selected notification. If successful the queuePosition will be reset to -1 indicating that no notification is currently selected.  
**Returns:** Boolean - Indicates if the notification was removed successfully.

**Example**  
```js
if (voyent.notify.removeSelectedNotification()) {
    console.log('Notification removed successfully!');
}
```

<a name="injectNotificationData"></a>
##### injectNotificationData()
Injects the selected notification into elements with data-selected-* attributes. Currently has special support for input
and select elements. For all other elements the data will be inserted as text content.

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

<a name="selectNotification"></a>
##### selectNotification(notification)
Sets the selected notification to the one passed if it is a valid notification in the queue.  
**Returns:** Boolean - Indicates if the notification was set successfully.

| Param        | Description                        | Type   |
| ------------ | ---------------------------------- | ------ |
| notification | The notification object to be set. | Object |

**Example**  
```js
voyent.notify.selectNotification(voyent.notify.getNextNotification());
```

<a name="selectNotificationAt"></a>
##### selectNotificationAt(index)
Sets the selected notification to the one in the queue at the specified index.  
**Returns:** Boolean - Indicates if the notification was set successfully.

| Param | Description                                            | Type    |
| ----- | ------------------------------------------------------ | ------- |
| index | The zero-based index of the notification in the queue. | Integer |

**Example**  
```js
voyent.notify.selectNotificationAt(3);
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

| Param | Description                                            | Type    |
| ----- | ------------------------------------------------------ | ------- |
| index | The zero-based index of the notification in the queue. | Integer |

**Example**  
```js
var fourthNotification = voyent.notify.getNotificationAt(3);
```

<a name="getNextNotification"></a>
##### getNextNotification()
Returns the next (newer) notification in the queue or null if there is no next.  
**Returns:** Object - The notification.

**Example**  
```js
var nextNotification = voyent.notify.getNextNotification();
```

<a name="getPreviousNotification"></a>
##### getPreviousNotification()
Returns the previous (older) notification in the queue or null if there is no previous.  
**Returns:** Object - The notification.

**Example**  
```js
var previousNotification = voyent.notify.getPreviousNotification();
```

<a name="getNewestNotification"></a>
##### getNewestNotification()
Returns the newest notification by date that is currently in the queue or null if the queue is empty.  
**Returns:** Object - The notification.

**Example**  
```js
var newestNotification = voyent.notify.getNewestNotification();
```

<a name="getOldestNotification"></a>
##### getOldestNotification()
Returns the oldest notification by date that is currently in the queue or null if the queue is empty.  
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

| Param | Description                                            | Type    |
| ----- | ------------------------------------------------------ | ------- |
| index | The zero-based index of the notification in the queue. | Integer |

**Example**  
```js
voyent.notify.removeNotificationAt(1);
```

<a name="clearNotificationQueue"></a>
##### clearNotificationQueue()
Removes all notifications from the notification queue (including clearing the selected notification) and resets the 
queuePosition to -1.  

**Example**  
```js
voyent.notify.clearNotificationQueue();
```


<a name="events"></a>
### Events

<a name="voyentNotifyInitialized"></a>
##### voyentNotifyInitialized
Fired after the library is initialized and listening for new notifications. This is the recommended place to
change default configuration options. Only fires once on initial load.  
**Cancelable:** false

| Param  | Description                  | Type    |
| ------ | ---------------------------- | ------- |
| config | The current config settings. | Object  |

**Example**  
```js
//set the desired default config
document.addEventListener('voyentNotifyInitialized',function(e) {
    e.detail.config.toast.enabled = false;
    e.detail.config.native.enabled = false;
});
```

<a name="notificationReceived"></a>
##### notificationReceived
Fired after a new notification is received in the browser. Not cancelable.  
**Cancelable:** false

| Param        | Description                              | Type   |
| ------------ | ---------------------------------------- | ------ |
| notification | The notification that was just received. | Object |

**Example**  
```js
document.addEventListener('notificationReceived',function(e) {
    console.log('Notification received:',JSON.stringify(e.detail.notification));
});
```

<a name="beforeQueueUpdated"></a>
##### beforeQueueUpdated
Fired before the queue is updated. An update will be triggered when loading a queue from storage or adding, removing or clearing the queue. Cancel the event to prevent the operation.  
**Cancelable:** true

| Param        | Description                                                                                                                          | Type     |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| op           | The operation being performed on the queue. One of 'add','del','clear',load'. Load indicates the queue is being loaded from storage. | String   |
| notification | The notification being added or removed (only provided if op = 'add' or 'del').                                                      | Object   |
| queueToLoad  | The queue that is being loaded from storage (only provided if op = 'load').                                                          | Object[] |
| queue        | The queue before the operation is performed.                                                                                         | Object[] |

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

| Param        | Description                                                                                                                             | Type     |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| op           | The operation that was just performed on the queue. One of 'add','del','clear',load'. Load indicates the queue was loaded from storage. | String   |
| notification | The notification that was added or removed (only provided if op = 'add' or 'del').                                                      | Object   |
| queue        | The queue after the operation was performed.                                                                                            | Object[] |

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
Fired before a notification is displayed. Fires for both toast and browser native notifications. Cancel the event to prevent the notification from being displayed.    
**Cancelable:** true

| Param        | Description                              | Type    |
| ------------ | ---------------------------------------- | ------- |
| notification | The notification that will be displayed. | Object  |

**Example**  
```js
//prevent notifications from being displayed based on some criteria
document.addEventListener('beforeDisplayNotification',function(e) {
    if (e.detail.notification.details.indexOf('debug') > -1) {
        e.preventDefault();
    }
});
```

<a name="afterDisplayNotification"></a>
##### afterDisplayNotification
Fired after a notification is displayed. Fires for both toast and browser native notifications.    
**Cancelable:** false

| Param        | Description                                                                                            | Type   |
| ------------ | ------------------------------------------------------------------------------------------------------ | ------ |
| notification | The notification that was just displayed.                                                              | Object |
| toast        | The toast DOM element. Provided if the notification displayed was toast.                               | Object |
| native       | The Notification (Web Notification) object. Provided if the notification displayed was browser native. | Object |

**Example**  
```js
//change the message text for specific notifications
document.addEventListener('afterDisplayNotification',function(e) {
    var toast = e.detail.toast;
    if (toast && e.detail.notification.priority === 'critical') {
        var messageDiv = toast.querySelector('.message');
        messageDiv.setAttribute('style',messageDiv.getAttribute('style')+'color:red;font-weight:bold;');
    }
});
```

<a name="notificationChanged"></a>
##### notificationChanged
Fired after the selected property is changed. The notification returned may be null. If this event fires in relation to a
queue update then this event will always be fired AFTER the queue has been updated.

**Cancelable:** false

| Param        | Description                         | Type   |
| ------------ | ----------------------------------- | ------ |
| notification | The notification that was just set. | Object |

**Example**  
```js
//custom app handling each time a notification is selected
document.addEventListener('notificationChanged',function(e) {
    myApp.doSpecialHandling();
});
```

<a name="notificationClicked"></a>
##### notificationClicked  
Fired when a notification is clicked. Fires for both toast and browser native notifications. Cancel the event to prevent the app from redirecting to the URL specified in the notification.  
**Cancelable:** true

| Param        | Description                                                                                            | Type   |
| ------------ | ------------------------------------------------------------------------------------------------------ | ------ |
| notification | The notification that was just clicked.                                                                | Object |
| toast        | The toast DOM element. Provided if the notification clicked was toast.                                 | Object |
| native       | The Notification (Web Notification) object. Provided if the notification displayed was browser native. | Object |

**Example**  
```js
//prevent redirection in specific cases
document.addEventListener('notificationClicked',function(e) {
    if (myApp.currentUser.isAdmin) {
        e.preventDefault();
    }
});
```

<a name="notificationClosed"></a>
##### notificationClosed
Fired when a notification is closed. Fires for both toast and browser native notifications. Cancel the event to prevent the notification from closing automatically (toast notifications only).  
**Cancelable:** true

| Param        | Description                                                                                            | Type   |
| ------------ | ------------------------------------------------------------------------------------------------------ | ------ |
| notification | The notification being closed.                                                                         | Object |
| toast        | The toast DOM element. Provided if the notification being closed is toast.                             | Object |
| native       | The Notification (Web Notification) object. Provided if the notification displayed was browser native. | Object |

**Example**  
```js
//prevent specific notifications from being closed
document.addEventListener('notificationClosed',function(e) {
    if (e.detail.notification.payload.persist) {
        e.preventDefault();
    }
});
```
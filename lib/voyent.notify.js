if (!(bridgeit && bridgeit.io && bridgeit.xio)) {
    throw new Error('voyent.notify.js requires bridgeit.js, bridgeit.io.js and bridgeit.xio.js, please include these before voyent.notify.js');
}

(function (v) {

    "use strict";

    //session storage keys
    var INJECT_KEY = 'voyentNotificationToInject';
    var QUEUE_KEY = 'voyentNotificationQueue';

    //toast
    var TOAST_CONTAINER_ID = 'voyent_toast_container';

    //api reference
    var notify;

    // Set up the notify namespace
    if (!v.notify) {
        // Public API
        notify = v.notify = {

            // Public attributes
            payload: null, //the current notification payload
            metadata: null, //the current notification metadata
            queue: [], //the notification queue

            //configurable options
            config: {
                //generic notification config options
                hideAfterClick:true, //indicates if the notification should be hidden after clicking on it
                clickListener:null, //custom click listener
                title:'',
                icon:'',

                //toast notification config options
                toast: {
                    enabled:true, //indicates if toast notifications should be shown
                    hideAfterMs:-1,//5000, //milliseconds that the notification will be automatically hidden after shown (specify <=0 to never hide the notification)
                    stackLimit:3, //indicates the number of notifications that will stack (specify <=0 to have no limit)
                    overwriteOld:true, //indicates if new toast notifications should overwrite old ones
                    position:'top-right', //position of toast notifications on page (top-right|top-left|bottom-right|bottom-left)
                    spacing:2, //number of pixels that the toast notifications should be spaced apart
                    style:''
                },

                //native/desktop notification config options
                native: {
                    enabled:true, //indicates if native notifications should be enabled (still must be allowed by user in browser)
                    hideAfterMs:-1 //milliseconds that the notification will be automatically hidden after shown (specify <=0 to never hide the notification)
                },
                close: {
                    enabled:true,
                    clickListener:null,
                    style:''
                }
            },

            // Private attributes
            _listener: null, //reference to the xio.push listener
            _queuePos: -1, //the current notification position in the queue

            /**
             * Start listening for notifications.
             */
            startListening: function() {
                if (this._listener) {
                    return;
                }

                //setup push listener
                var _this = this;
                this._listener = function (notification) {
                    if (!_convertNotification(notification)) {
                        return;
                    }
                    //update queue and internal map
                    _this.queue.push(notification);
                    //update queue in session storage
                    _setQueueInStorage();
                    //display notification
                    _displayNotification(notification);
                    if (!_this.payload && !_this.metadata) {
                        //set to the current notification since we don't have one yet
                        _this.setCurrentNotification(notification);
                        _this._queuePos = 0;
                        //inject notification data into the page if they are on
                        //the page and currently have no active notification
                        var metadataUrl = document.createElement('a');   //use anchor tag to parse URL in metadata
                        metadataUrl.href = notification.metadata.url;
                        if (window.location.host === metadataUrl.host &&
                            window.location.pathname === metadataUrl.pathname) {
                            _this.injectNotificationData();
                        }
                    }
                    _fireEvent('notificationReceived',{'notification':JSON.parse(JSON.stringify(notification))},false,false);
                };
                //add push listener
                v.xio.push.addListener(this._listener);
            },

            /**
             * Stop listening for notifications.
             */
            stopListening: function() {
                v.xio.push.removeListener(this._listener);
                this._listener = null;
                //since they explicitly stopped listening them remove the login listener as well
                window.removeEventListener('bridgeit-login-succeeded',_loginListener);
            },

            /**
             * Returns an integer that represents the number of notifications currently in the queue.
             * @returns {Number}
             */
            getNotificationCount: function() {
                return this.queue.length;
            },

            /**
             * Return the currently selected notification or null if no notification is selected.
             * @returns {*}
             */
            getCurrentNotification: function() {
                return this.payload && this.metadata ? {"payload":this.payload,"metadata":this.metadata} : null;
            },

            /**
             * Returns the notification at the specified index or an empty object if none was found.
             * @param index
             * @returns {Object}
             */
            getNotificationAt: function(index) {
                return this.queue[index] ? this.queue[index] : {};
            },

            /**
             * Returns the next notification in the queue or an empty object if none was found.
             * @returns {*}
             */
            getNextNotification: function() {
                var newPos = this._queuePos+1;
                if (this.queue[newPos]) {
                    this._queuePos = newPos;
                    return this.queue[newPos];
                }
                return {};
            },

            /**
             * Returns the previous notification in the queue or an empty object if none was found.
             * @returns {*}
             */
            getPreviousNotification: function() {
                var newPos = this._queuePos-1;
                if (this.queue[newPos]) {
                    this._queuePos = newPos;
                    return this.queue[newPos];
                }
                return {};
            },

            /**
             * Returns the newest notification that is currently in the queue.
             * @returns {*}
             */
            getNewestNotification: function() {
                return this.queue[this.queue.length-1];
            },

            /**
             * Returns the oldest notification that is currently in the queue.
             * @returns {*}
             */
            getOldestNotification: function() {
                return this.queue[0];
            },

            /**
             * Removes the specified notification from the queue.
             * @param notification
             * @returns {boolean} - Indicates if the notification was removed successfully.
             */
            removeNotification: function(notification) {
                for (var i=0; i<this.queue.length; i++) {
                    if (this.queue[i] === notification) {
                        this.queue.splice(i,1);
                        _setQueueInStorage();
                        return true;
                    }
                }
                return false;
            },

            /**
             * Removes the notification at the specified index.
             * @param index
             * @returns {boolean} - Indicates if the notification was removed successfully.
             */
            removeNotificationAt: function(index) {
                if (this.queue[index]) {
                    this.queue.splice(index,1);
                    _setQueueInStorage();
                    return true;
                }
                return false;
            },

            /**
             * Removes the currently selected notification.
             * @returns {boolean} - Indicates if the notification was removed successfully.
             */
            removeCurrentNotification: function() {
                this.payload = null;
                this.metadata = null;
                _setCurrentNotificationInStorage();
                this.queue.splice(this._queuePos,1);
                _setQueueInStorage();
                this._queuePos = -1;
                return true;
            },

            /**
             * Removes all notifications from the notification queue.
             */
            clearNotificationQueue: function() {
                this.queue = [];
                _setQueueInStorage();
            },

            /**
             * Redirects the browser to the URL specified in the metadata of the passed notification and injects the notification data.
             * @param notification
             */
            redirectToNotification: function(notification) {
                if (!notification.metadata || !notification.metadata.url) {
                    return;
                }
                //save the notification to inject in session storage so it survives the redirect
                _setCurrentNotificationInStorage(notification);
                //redirect browser
                window.location.replace(notification.metadata.url);
            },
            
            /**
             * Injects the current notification into the innerHTML of elements with data-payload-* and data-metadata-* attributes.
             */
            injectNotificationData: function() {
                var key, elements, i;
                //inject payload
                for (key in notify.payload) {
                    if (!notify.payload.hasOwnProperty(key)) {
                        continue;
                    }
                    elements = document.querySelectorAll('[data-payload-'+key+']');
                    for (i=0; i<elements.length; i++) {
                        elements[i].innerHTML = notify.payload[key];
                    }
                }
                //inject metadata
                for (key in notify.metadata) {
                    if (!notify.metadata.hasOwnProperty(key)) {
                        continue;
                    }
                    elements = document.querySelectorAll('[data-metadata-'+key+']');
                    for (i=0; i<elements.length; i++) {
                        elements[i].innerHTML = notify.metadata[key];
                    }
                }
            },

            /**
             * Removes the injected notification data from the page.
             */
            clearInjectedNotificationData: function() {
                var key, elements, i;
                //inject payload
                for (key in notify.payload) {
                    if (!notify.payload.hasOwnProperty(key)) {
                        continue;
                    }
                    elements = document.querySelectorAll('[data-payload-'+key+']');
                    for (i=0; i<elements.length; i++) {
                        elements[i].innerHTML = '';
                    }
                }
                //inject metadata
                for (key in notify.metadata) {
                    if (!notify.metadata.hasOwnProperty(key)) {
                        continue;
                    }
                    elements = document.querySelectorAll('[data-metadata-'+key+']');
                    for (i=0; i<elements.length; i++) {
                        elements[i].innerHTML = '';
                    }
                }
            },

            /**
             * Sets the current notification to the one passed if it is valid.
             * @param notification
             * @returns {boolean} - Indicates if the notification was set successfully.
             */
            setCurrentNotification: function(notification) {
                for (var i=0; i<this.queue.length; i++) {
                    if (this.queue[i] === notification) {
                        this.payload = notification.payload;
                        this.metadata = notification.metadata;
                        this._queuePos = i;
                        _setCurrentNotificationInStorage();
                        return true;
                    }
                }
                return false;
            }
        };
    }


    // Private API
    var TOAST_STARTING_POS = 100;
    var displayedToasts=[];
    var queuedToasts=[];

    function _initialize() {
        window.addEventListener('bridgeit-login-succeeded',_loginListener());
    }

    function _convertNotification(notification) {
        try {
            notification.payload = notification.message.payload;
            notification.metadata = notification.message.metadata;
            delete notification.message;
            notification.metadata.time = notification.time;
            delete notification.time;
            notification.metadata.group = notification.group;
            delete notification.group;
            notification.metadata.username = notification.username;
            delete notification.username;
        }
        catch (e) {
            return false;
        }
        return true;
    }

    function _fireEvent(name,detail,bubbles,cancelable) {
        var event = new CustomEvent(name,{'detail':detail,bubbles:!!bubbles,cancelable:!!cancelable});
        document.dispatchEvent(event);
    }

    function _loginListener() {
        notify.startListening();
        _doOnLoad();
    }

    function _displayNotification(notification) {
        if (notify.config.native.enabled && window.Notification && Notification.permission === 'granted') {
            _displayNativeNotification(notification);
        }
        else if (notify.config.toast.enabled) {
            _displayToastMessage(notification);
        }
    }

    function _customClickListener(notification,nativeNotification,toastNotification) {
        return function() {
            //run their listener
            notify.config.clickListener(notification);
            //don't close the notification if the user used event.preventDefault();
            if (!event.defaultPrevented) {
                //close the notification
                if (notify.config.hideAfterClick) {
                    if (toastNotification) {
                        _hideToastMessage(toastNotification,0);
                    }
                    else if (nativeNotification) {
                        nativeNotification.close();
                    }
                }
            }
        };
    }

    function _customCloseListener(toastNotification) {
        return function() {
            //run their listener
            notify.config.close.clickListener(toastNotification);
            //don't close the notification if the user used event.preventDefault();
            if (!event.defaultPrevented) {
                _hideToastMessage(toastNotification,0);
            }
        };
    }

    function _displayNativeNotification(notification) {
        var n = new Notification(notify.config.title, {
            body:notification.metadata.desc,
            icon:notify.config.icon
        });
        //add onclick listener for redirecting or custom handling by user
        n.onclick = notify.config.clickListener ? _customClickListener(notification,n) : function() {
            event.preventDefault(); // prevent the browser from focusing the Notification's tab
            notify.redirectToNotification(notification);
            n.close();
        };

        //setup hiding the notifications after they are shown
        n.onshow = function() {
            // We use the onshow handler for hiding the notifications because if there are too many notifications on
            // the page then the notification might get added to the queue until it has room to render. If this happens
            // then the notification might close immediately after it is shown since the timer starts as soon
            // as the notification is created.
            if (notify.config.native.hideAfterMs > 0) {
                _hideNativeNotification(n, notify.config.native.hideAfterMs);
            }
        };
    }

    function _hideNativeNotification(nativeNotification,ms) {
        setTimeout(function() {
            nativeNotification.close();
        },ms);
    }

    function _displayToastMessage(notification) {
        if (!document.getElementById(TOAST_CONTAINER_ID)) {
            _createNotificationContainer();
        }
        //create toast message
        var toast = document.createElement('div');
        //add children elements
        _createToastChildren(toast,notification);
        //set styling
        _setToastStyle(toast);
        //Need to append first so we can figure out the height of the notification
        document.getElementById(TOAST_CONTAINER_ID).appendChild(toast);

        setTimeout(function() {
            var toastMsg = toast.getElementsByClassName('message')[0];
            var toastMsgHeight = toast.scrollHeight-toast.clientHeight; //in case the message is too long for the max-height of the toast
            if (toastMsgHeight === 0) {
                toastMsgHeight = toastMsg.clientHeight; //message is not too long
            }
            toastMsg.style.height = toastMsgHeight+'px';


            if ((notify.config.toast.stackLimit > displayedToasts.length) || notify.config.toast.stackLimit <= 0) {
                displayToast(toast);
            }
            else {
                //add to queue
                queuedToasts.push(toast);
                if (notify.config.toast.overwriteOld) {
                    //replace oldest notification
                    _hideToastMessage(displayedToasts[0],0);
                }
            }
        },0);
    }

    function displayToast(toast) {
        var height = toast.offsetHeight;

        //calculate the position we should add the notification in the stack
        var yPosition = 0;
        for (var i=0; i<displayedToasts.length; i++) {
            yPosition += parseInt(displayedToasts[i].getAttribute('data-height'))+notify.config.toast.spacing; //add spacing between notifications
        }

        var isBottom = notify.config.toast.position.indexOf('bottom') > -1;
        toast.style.opacity = 1;
        toast.style.transform = 'translateY('+ (isBottom ? (-Math.abs(yPosition)) : yPosition) +'px)';
        toast.style.webkitTransform = 'translateY('+ (isBottom ? (-Math.abs(yPosition)) : yPosition) +'px)';
        toast.setAttribute('data-translate-y',yPosition.toString()); //store translate-y for later use
        toast.setAttribute('data-height',height.toString()); //store height for later use

        displayedToasts.push(toast);

        var queuedPos = queuedToasts.indexOf(toast);
        if (queuedPos > -1) {
            queuedToasts.splice(queuedPos,1);
        }
    }

    function updateDisplayedNotifications(toastToRemove) {
        //check if we need to slide any notifications up,
        //if the last notification closed was in the last
        //position then we don't need to slide
        var index = displayedToasts.indexOf(toastToRemove);
        var isBottom = notify.config.toast.position.indexOf('bottom') > -1;
        if (index > -1 && index !== displayedToasts.length-1) {
            for (var i=index+1; i<displayedToasts.length; i++) {
                var toastToSlide = displayedToasts[i];
                var newPos;
                //account for spacing between toasts
                var paddingMultiplier = index === 0 ? 1 : index;
                var padding = notify.config.toast.spacing * paddingMultiplier;
                if (isBottom) {
                    newPos = parseInt(toastToSlide.getAttribute('data-translate-y')) +
                             parseInt(toastToRemove.getAttribute('data-height')) +
                             padding;
                }
                else {
                    newPos = parseInt(toastToSlide.getAttribute('data-translate-y')) -
                             parseInt(toastToRemove.getAttribute('data-height')) -
                             padding;
                }
                //update the stored position of the toast
                toastToSlide.setAttribute('data-translate-y',newPos);
                //slide the toast
                toastToSlide.style.transform = 'translateY('+ (isBottom ? (-Math.abs(newPos)) : newPos) +'px)';
                toastToSlide.style.webkitTransform = 'translateY('+ (isBottom ? (-Math.abs(newPos)) : newPos) +'px)';
            }

        }
        //delete the notification
        var toastIndex = displayedToasts.indexOf(toastToRemove);
        if (toastIndex > -1) {
            displayedToasts.splice(toastIndex,1);
        }

        var newToast = queuedToasts[0];
        if (newToast) {
            displayToast(newToast);
        }
    }

    function _hideToastMessage(toast,ms) {
        setTimeout(function() {
            var hideTranslateY = notify.config.toast.position.indexOf('bottom') > -1 ? TOAST_STARTING_POS : -Math.abs(TOAST_STARTING_POS);

            // var dataTranslateY = parseInt(toast.getAttribute('data-translate-y'));
            notify._lastNotificationHidden = parseInt(toast.getAttribute('data-translate-y'));
            toast.style.opacity = '0';
            /*toast.style.transform = 'translateY('+dataTranslateY+'px)';
            toast.style.webkitTransform = 'translateY('+dataTranslateY+'px)';*/
            toast.style.transform = 'translateY('+hideTranslateY+'px)';
            toast.style.webkitTransform = 'translateY('+hideTranslateY+'px)';

            //transition effect is for 300ms so remove the toast after 400ms
            setTimeout(function() {
                if (document.getElementById(TOAST_CONTAINER_ID).contains(toast)) {
                    document.getElementById(TOAST_CONTAINER_ID).removeChild(toast);
                    updateDisplayedNotifications(toast);
                }
            },400);
        },ms);
    }

    function _createToastChildren(toast,notification) {
        //add close button
        if (notify.config.close.enabled) {
            var closeDiv = document.createElement('div');
            closeDiv.className = 'close';
            closeDiv.style.float = 'right';
            closeDiv.style.fontSize = '15px';
            closeDiv.style.color = '#888888';
            closeDiv.style.cursor = 'pointer';
            closeDiv.style.marginTop = '-10px';
            closeDiv.style.marginBottom = '-10px';
            //add users custom styling
            closeDiv.setAttribute('style',closeDiv.getAttribute('style')+notify.config.close.style);
            closeDiv.innerHTML = '&#10006;';
            //add onclick listener for closing the notification
            closeDiv.onclick = notify.config.close.clickListener ? _customCloseListener(toast) : function() {
                _hideToastMessage(toast,0);
            };
            toast.appendChild(closeDiv);

            //clear float
            var clearClose = document.createElement('div');
            clearClose.style.clear = 'both';
            toast.appendChild(clearClose);
        }

        //add icon
        if (notify.config.icon && notify.config.icon.trim().length > 0) {
            var iconDiv = document.createElement('div');
            iconDiv.className = 'icon';
            iconDiv.style.maxWidth = '40px';
            iconDiv.style.marginRight = '10px';
            iconDiv.style.float = 'left';

            var icon = document.createElement('img');
            icon.src = notify.config.icon;
            icon.style.display = 'block';
            icon.style.height = '100%';
            icon.style.width = '100%';
            iconDiv.appendChild(icon);
            toast.appendChild(iconDiv);
        }

        //add title
        if (notify.config.title && notify.config.title.trim().length > 0) {
            var titleDiv = document.createElement('div');
            titleDiv.className = 'title';
            titleDiv.style.fontSize = '16px';
            titleDiv.style.fontWeight = 'bold';
            titleDiv.style.marginBottom = '5px';
            titleDiv.innerHTML=notify.config.title;
            toast.appendChild(titleDiv);
        }

        //add message
        var msgDiv = document.createElement('div');
        msgDiv.className = 'message';
        msgDiv.style.overflow = 'hidden';
        msgDiv.style.cursor = 'pointer';
        msgDiv.innerHTML = notification.metadata.desc;

        //add onclick listener for redirecting or custom handling by user
        msgDiv.onclick = notify.config.clickListener ? _customClickListener(notification,null,toast) : function() {
            notify.redirectToNotification(notification);
            _hideToastMessage(toast,0);
        };
        toast.appendChild(msgDiv);

        //clear float
        var clearIcon = document.createElement('div');
        clearIcon.style.clear = 'left';
        toast.appendChild(clearIcon);
    }

    function _setToastStyle(toast) {
        //do some default styling
        toast.style.position = 'fixed';
        toast.style.backgroundColor = '#323232';
        toast.style.color = '#f1f1f1';
        toast.style.minHeight = '45px';
        toast.style.minWidth = '288px';
        toast.style.padding = '15px';
        toast.style.boxSizing = 'border-box';
        toast.style.boxShadow = '0 2px 5px 0 rgba(0, 0, 0, 0.26)';
        toast.style.borderRadius = '2px';
        toast.style.margin = '12px';
        toast.style.fontSize = '14px';
        toast.style.transition = 'transform 0.3s, opacity 0.3s';
        toast.style.webKitTransition = '-webkit-transform 0.3s, opacity 0.3s';
        toast.style.opacity = '0';

        toast.style.maxWidth = '350px';
        toast.style.overflow = 'hidden';

        switch (notify.config.toast.position) {
            case 'top-right':
                toast.style.right = '0';
                toast.style.top = '0';
                toast.style.transform = 'translateY('+(-Math.abs(TOAST_STARTING_POS))+'px)';
                toast.style.webkitTransform = 'translateY('+(-Math.abs(TOAST_STARTING_POS))+'px)';
                break;
            case 'bottom-right':
                toast.style.right = '0';
                toast.style.bottom = '0';
                toast.style.transform = 'translateY('+TOAST_STARTING_POS+'px)';
                toast.style.webkitTransform = 'translateY('+TOAST_STARTING_POS+'px)';
                break;
            case 'top-left':
                toast.style.left = '0';
                toast.style.top = '0';
                toast.style.transform = 'translateY('+(-Math.abs(TOAST_STARTING_POS))+'px)';
                toast.style.webkitTransform = 'translateY('+(-Math.abs(TOAST_STARTING_POS))+'px)';
                break;
            case 'bottom-left':
                toast.style.left = '0';
                toast.style.bottom = '0';
                toast.style.transform = 'translateY('+TOAST_STARTING_POS+'px)';
                toast.style.webkitTransform = 'translateY('+TOAST_STARTING_POS+'px)';
                break;
            default:
                //default to top-right
                toast.style.right = '0';
                toast.style.top = '0';
                toast.style.transform = 'translateY('+(-Math.abs(TOAST_STARTING_POS))+'px)';
                toast.style.webkitTransform = 'translateY('+(-Math.abs(TOAST_STARTING_POS))+'px)';
        }
        //add users custom styling
        toast.setAttribute('style',toast.getAttribute('style')+notify.config.toast.style);
    }

    function _createNotificationContainer() {
        var div = document.createElement('div');
        div.id = TOAST_CONTAINER_ID;
        document.body.appendChild(div);
    }

    function _doOnLoad() {
        if (document.readyState === "complete") {
            onload();
            return;
        }
        if (document.addEventListener) { //most browsers
            document.addEventListener("DOMContentLoaded", onload, false); //modern approach
            window.addEventListener("load", onload, false); //fallback to basic onload event

        }
        else if (document.attachEvent) { //IE <= 8 support
            document.attachEvent("onreadystatechange", onload); //"modern" approach
            window.attachEvent("onload", onload); //fallback to basic onload event
        }

        function onload() {
            //check if we have any notifications to inject
            try {
                var notification = _getCurrentNotificationFromStorage();
                if (notification && Object.keys(notification).length > 0) {
                    notify.payload = notification.payload;
                    notify.metadata = notification.metadata;
                    notify.injectNotificationData();
                }
            }
            catch(err) { }

            //check if we have a queue in storage to load
            try {
                var queue = _getQueueFromStorage();
                if (queue && queue.length > 0) {
                    notify.queue = queue;
                    _fireEvent('queueUpdated',{'queue':notify.queue.slice(0)},false,false);
                }
            }
            catch (err) { }

            //add our custom toast parent element to the page
            if (notify.config.toast.enabled && !document.getElementById(TOAST_CONTAINER_ID)) {
                _createNotificationContainer();
            }

            //check for desktop notification support and request permission
            if (notify.config.native.enabled && window.Notification && Notification.permission !== 'denied') {
                Notification.requestPermission(function(permission){});
            }
        }
    }

    function _setQueueInStorage() {
        if (!notify.queue || !notify.queue.length) {
            v.removeSessionStorageItem(btoa(QUEUE_KEY));
        }
        else {
            v.setSessionStorageItem(btoa(QUEUE_KEY),btoa(JSON.stringify(notify.queue)));
        }
        _fireEvent('queueUpdated',{'queue':notify.queue.slice(0)},false,false);
    }

    function _getQueueFromStorage() {
        return JSON.parse(atob(v.getSessionStorageItem(btoa(QUEUE_KEY))));
    }

    function _setCurrentNotificationInStorage() {
        if (!notify.payload && !notify.metadata) {
            v.removeSessionStorageItem(btoa(INJECT_KEY));
        }
        else {
            v.setSessionStorageItem(btoa(INJECT_KEY),btoa(JSON.stringify({
                "payload":notify.payload,
                "metadata":notify.metadata
            })));
        }
    }

    function _getCurrentNotificationFromStorage() {
        return JSON.parse(atob(v.getSessionStorageItem(btoa(INJECT_KEY))));
    }

    // Initialization
    _initialize();

})(bridgeit); //for now pass bridgeit object but eventually this will be voyent
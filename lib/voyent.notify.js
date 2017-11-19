if (typeof voyent === 'undefined') {
    throw new Error('voyent.notify.js requires voyent.js, please include this library before voyent.notify.js');
}

(function (v) {
    "use strict";

    var VOYENT_INJECT_KEY = 'voyentNotificationToInject';
    var VOYENT_TOAST_CONTAINER_ID = 'voyent_toast_container';
    var VOYENT_MAIL_QUERY_PARAMETER = 'nid';

    var notify;
    if (!v.notify) {
        //**************************************************************************************************************
        //************************************************* PUBLIC API *************************************************
        //**************************************************************************************************************

        notify = v.notify = {
            /**
             * @property {String[]} groups - The groups currently registered for notifications (readonly).
             * @default []
             */
            _groups: [],
            get groups() { return this._groups; },

            /**
             * @property {Object} selected - The selected notification (readonly).
             * @default null
             */
            _selected: null,
            get selected() { return this._selected; },

            /**
             * @property {Object[]} queue - The notification queue (readonly).
             * @default []
             */
            _queue: [],
            get queue() { return this._queue; },

            /**
             * @property {number} queuePosition - The zero-based index of the selected notification in the queue (readonly).
             * @default -1
             */
            _queuePosition: -1,
            get queuePosition() { return this._queuePosition; },

            config: { //config options
                /**
                 * @property {string} autoSelectNotification - Provides options for auto selecting notifications so that 
                 * each time a selected notification is removed a new one is selected. One of [disabled|oldest|newest].
                 * @default 'disabled'
                 */
                _autoSelectNotification: 'disabled',
                set autoSelectNotification(val) {
                    val = val.toLowerCase();
                    if (['disabled','oldest','newest'].indexOf(val) > -1) {
                        this._autoSelectNotification = val;
                    }
                    else { this._autoSelectNotification = 'disabled'; }
                },
                get autoSelectNotification() { return this._autoSelectNotification; },


                /**
                 * @property {boolean} hideAfterClick - Indicates if notifications should be hidden after clicking on them.
                 * @default true
                 */
                _hideAfterClick: true,
                set hideAfterClick(val) { this._hideAfterClick = !!val; },
                get hideAfterClick() { return this._hideAfterClick; },

                toast: { //toast notification config options
                    /**
                     * @property {boolean} enabled - Indicates if toast notifications should be shown.
                     * @default true
                     */
                    _enabled: true,
                    set enabled(val) { this._enabled = !!val; },
                    get enabled() { return this._enabled; },

                    /**
                     * @property {number} hideAfterMs - Time in milliseconds that the notification will be automatically
                     * hidden after shown (specify <=0 to never hide the notification, making the toast closable only by clicking).
                     * @default 5000
                     */
                    _hideAfterMs: 5000,
                    set hideAfterMs(val) {
                        if (typeof val === 'number') { this._hideAfterMs = Math.round(val); }
                        else { this._hideAfterMs = 5000; }
                    },
                    get hideAfterMs() { return this._hideAfterMs; },

                    /**
                     * @property {number} stackLimit - Indicates the number of notifications that will be allowed to
                     * stack (specify <=0 to have no limit).
                     * @default 3
                     */
                    _stackLimit: 3,
                    set stackLimit(val) {
                        if (typeof val === 'number') { this._stackLimit = Math.round(val); }
                        else { this._stackLimit = 3; }
                    },
                    get stackLimit() { return this._stackLimit; },

                    /**
                     * @property {boolean} overwriteOld - Indicates if new toast notifications should overwrite/replace
                     * old ones in the stack.
                     * @default false
                     */
                    _overwriteOld: false,
                    set overwriteOld(val) { this._overwriteOld = !!val; },
                    get overwriteOld() { return this._overwriteOld; },

                    /**
                     * @property {string} position - Position of toast notifications on page.
                     * One of [top-right|top-left|bottom-right|bottom-left].
                     * @default 'top-right'
                     */
                    _position:'top-right',
                    set position(val) {
                        val = val.toLowerCase();
                        if (['top-right','top-left','bottom-right','bottom-left'].indexOf(val) > -1) {
                            this._position = val;
                        }
                        else { this._position = 'top-right'; }
                    },
                    get position() { return this._position; },

                    /**
                     * @property {number} spacing - Number of pixels that the toast notifications should be spaced apart.
                     * @default 2
                     */
                    _spacing:2,
                    set spacing(val) {
                        if (typeof val === 'number') { this._spacing = Math.round(val); }
                        else { this._spacing = 2; }
                    },
                    get spacing() { return this._spacing; },

                    /**
                     * @property {string} style - Custom styling that is applied to the top-level toast notification
                     * container. Any styling defined here will override the defaults.
                     * @default ''
                     */
                    _style:'',
                    set style(val) { this._style = val.toString(); },
                    get style() { return this._style; },

                    close: { //toast notification close container config options
                        /**
                         * @property {boolean} enabled - Indicates if the close button should be shown for toast notifications.
                         * @default true
                         */
                        _enabled: true,
                        set enabled(val) { this._enabled = !!val; },
                        get enabled() { return this._enabled; },

                        /**
                         * @property {string} style - Custom styling that is applied to the toast notification close
                         * container. Any styling defined here will override the defaults.
                         * @default ''
                         */
                        _style:'',
                        set style(val) { this._style = val.toString(); },
                        get style() { return this._style; }
                    }
                },

                native: { //native/desktop notification config options
                    /**
                     * @property {boolean} enabled - Indicates if native notifications should be enabled (still must be
                     * allowed by user in browser).
                     * @default true
                     */
                    _enabled: true,
                    set enabled(val) { this._enabled = !!val; },
                    get enabled() { return this._enabled; },

                    /**
                     * @property {number} hideAfterMs - Time in milliseconds that the notification will be automatically
                     * hidden after shown (specify <=0 to never hide the notification).
                     * @default -1
                     */
                    _hideAfterMs: -1,
                    set hideAfterMs(val) {
                        if (typeof val === 'number') { this._hideAfterMs = Math.round(val); }
                        else { this._hideAfterMs = -1; }
                    },
                    get hideAfterMs() { return this._hideAfterMs; }
                }
            },

            //Events

            //Useful for setting config options, setting up event listeners, etc...
            /**
             * Fired after the library is initialized and listening for new notifications. This is the recommended place
             * to change default configuration options if the listener is guaranteed to exist before the library loads.
             * Only fires on initial load.
             * Not cancelable.
             * @event voyentNotifyInitialized
             */
            
            /**
             * Fired after a new notification is received in the browser. Not cancelable.
             * @event notificationReceived
             */

            //Useful for previewing the new item being added to the queue and throwing it away before it's added using preventDefault().
            /**
             * Fired before the queue is updated. An update will be triggered when loading a queue from
             * storage or adding, removing or clearing the queue. Cancel the event to prevent the operation.
             * @event beforeQueueUpdated
             */

            //Useful for keeping the various aspects of the app in sync (queue, notification count, etc...)
            /**
             * Fired after the queue is updated. Not cancelable.
             * @event afterQueueUpdated
             */

            //Useful for preventing the notification from being displayed using e.preventDefault().
            /**
             * Fired before a notification is displayed. Fires for both toast and browser native notifications.
             * Cancel the event to prevent the notification from being displayed.
             * @event beforeDisplayNotification
             */

            //Useful for custom CSS effects/styling
            /**
             * Fired after a notification is displayed. Fires for both toast and browser native notifications. Not cancelable.
             * @event afterDisplayNotification
             */

            //Useful to do custom handling on the selected notification. Especially after the asynchronous call of fetching a notification from the mailbox service.
            /**
             * Fired after the selected property is changed. The notification returned may be null. If this event fires
             * in relation to a queue update then this event will always be fired AFTER the queue has been updated. Not cancelable.
             * @event notificationChanged
             */

            //Useful for custom redirecting (for apps that use custom routing).
            /**
             * Fired when a notification is clicked. Fires for both toast and browser native notifications. Cancel the
             * event to prevent the app from redirecting to the URL specified in the notification.
             * @event notificationClicked
             */

            //Useful for custom close behaviour or preventing the notification from closing.
            /**
             * Fired when a notification is closed. Fires for both toast and browser native notifications. Cancel the event
             * to prevent the notification from closing automatically (toast notifications only).
             * @event notificationClosed
             */

            //Private/internal attributes
            _listener: null, //reference to the push listener
            _pushServiceStarted: false, //flag indicating if the push service is initialized
            _queuedGroups: [], //groups waiting for the push service to be started before they are joined

            /**
             * Initialize the library. This function MUST be called to enable the library. The initialization process may
             * fire various events so we always suggest calling this after you setup any listeners of interest. Can be
             * triggered before or after logging in.
             */
            initialize: function() {
                if (!voyent.auth.isLoggedIn()) {
                    window.addEventListener('voyent-login-succeeded',_setupListeners);
                }
                else {
                    _setupListeners();
                }
            },

            /**
             * Start listening for notifications. This function is called automatically when the library is initialized and
             * a user is logged in via voyent.js. This function only needs to be called manually after stopListening has
             * been called.
             */
            startListening: function() {
                if (this._listener) { return; }

                //start the push service if we haven't already
                var _this = this;
                if (!_this._pushServiceStarted) {
                    v.push.startPushService({}).then(function () {
                        _this._pushServiceStarted = true;
                        //join any queued push groups
                        for (var i=0; i<_this._queuedGroups.length; i++) {
                            _this.joinGroup(_this._queuedGroups[i]);
                        }
                    }).catch(function (e) {
                        _this._pushServiceStarted = false;
                        _fireEvent('message-error','Error starting the push service: ' +
                                  (e.responseText || e.message || e), false);
                    });
                }

                //declare push listener
                this._listener = function (pushId,notification) {
                    if (!notification) { return; }
                    _fireEvent('notificationReceived',{"notification":notification},false);
                    var cancelled = _fireEvent('beforeQueueUpdated',{"op":"add","notification":notification,"queue":_this.queue.slice(0)},true);
                    if (cancelled) {
                        return;
                    }
                    _this._queue.push(notification);
                    _fireEvent('afterQueueUpdated',{"op":"add","notification":notification,"queue":_this.queue.slice(0)},false);
                    _this.displayNotification(notification);
                    if (!_this.selected) {
                        //we don't have a selected notification so set to this new one
                        _this.selectNotification(notification);
                        //inject notification data into the page if they are on
                        //the relevant page and currently have no selected notification
                        var notificationUrl = document.createElement('a'); //use anchor tag to parse notification return URL
                        notificationUrl.href = notification.url;
                        if (window.location.host === notificationUrl.host &&
                            window.location.pathname === notificationUrl.pathname) {
                            _this.injectNotificationData();
                        }
                    }
                };
                //Add a group listener for the current user's username.
                var groupToJoin = v.auth.getLastKnownUsername();
                this.joinGroup(groupToJoin);
            },

            /**
             * Stop listening for notifications for all groups currently joined. No new notifications will be received
             * by the library after calling this function but the other features of the library will still be available.
             */
            stopListening: function() {
                for (var i=0; i<this._groups.length; i++) {
                    this.leaveGroup(this._groups[i]);
                }
                this._listener = null;
                //since they explicitly stopped listening them remove the login listener as well
                window.removeEventListener('voyent-login-succeeded',_setupListeners);
            },

            /**
             * Registers a new push listener for the specified group.
             * @param group
             */
            joinGroup: function(group) {
                var _this = this;
                if (group && typeof group === 'string' &&
                    this._groups.indexOf(group) === -1) {
                    //the push service is not ready so add the group to the queue so we can add it later
                    if (!this._pushServiceStarted &&
                        this._queuedGroups.indexOf(group) === -1) {
                        this._queuedGroups.push(group);
                        return;
                    }
                    v.push.addPushListener({
                        'group': group,
                        'callback': this._listener
                    }).then(function() {
                        //remove the group from the queue
                        var index = _this._queuedGroups.indexOf(group);
                        if (index > -1) {
                            _this._queuedGroups.splice(index,1);
                        }
                        //add the group to our list of joined groups
                        _this._groups.push(group);
                    }).catch(function(e) {
                        _fireEvent('message-error','Error when joining group: ' +
                                  (e.responseText || e.message || e), false);
                    });
                }
            },

            /**
             * Removes the registered push listener for the specified group.
             * @param group
             */
            leaveGroup: function(group) {
                var _this = this;
                if (group && typeof group === 'string') {
                    var index = this._groups.indexOf(group);
                    if (index > -1) {
                        v.push.removePushListener({
                            'group': group
                        }).then(function() {
                            _this._groups.splice(index,1);
                        });
                    }
                }
            },

            /**
             * Fetches all the notifications in the current user's mailbox and adds them to the queue. If an
             * `nid` is provided then the notification matching that nid will be automatically selected.
             * @param nid
             */
            refreshNotificationQueue: function(nid) {
                var _this = this;
                v.mailbox.findMessages({"username":v.auth.getLastKnownUsername(),"fields":{"_id":0},"options":{"sort":{"time":-1}}}).then(function(mail) {
                    if (mail) {
                        var notification, existingNotification;
                        for (var i=0; i<mail.length; i++) {
                            notification = mail[i];
                            if (!_parseNotificationForBrowser(notification)) {
                                continue;
                            }
                            //Ensure we don't re-add the notification to the queue in case it was received
                            //in the browser and then they navigated from a non-browser transport.
                            existingNotification = _getNotificationByNid(notification);
                            if (!existingNotification) {
                                var cancelled = _fireEvent('beforeQueueUpdated',{"op":"add","notification":notification,"queue":_this.queue.slice(0)},true);
                                if (cancelled) {
                                    continue;
                                }
                                _this._queue.push(notification);
                                _fireEvent('afterQueueUpdated',{"op":"add","notification":notification,"queue":_this.queue.slice(0)},false);
                            }
                            //Select the notification associated with the nid.
                            if (nid && ((existingNotification && existingNotification.nid === nid) || notification.nid === nid)) {
                                _this.selectNotification(existingNotification || notification);
                                _this.injectNotificationData();
                            }
                        }
                        //Check if we have any notifications in storage to select.
                        if (!notify.selected) {
                            try {
                                var nidFromStorage = _getSelectedNidFromStorage();
                                if (nidFromStorage) {
                                    //Select the notification and inject data.
                                    var tmpNotification = {};
                                    tmpNotification[VOYENT_MAIL_QUERY_PARAMETER] = nidFromStorage;
                                    notify.selectNotification(tmpNotification);
                                    notify.injectNotificationData();
                                }
                            }
                            catch(e) {
                                _fireEvent('message-error','Error loading selected notification from storage: ' +
                                                           (e.responseText || e.message || e), false);
                            }
                        }
                    }
                }).catch(function(e) {
                    if (e.status === 404) {
                        _fireEvent('message-error','Notification does not exist in your mailbox', false);
                        return;
                    }
                    _fireEvent('message-error','Error trying to fetch notification: ' +
                        (e.responseText || e.message || e), false);
                });
            },

            /**
             * Returns an integer that represents the number of notifications currently in the queue.
             * @returns {number} - The notification count.
             */
            getNotificationCount: function() {
                return this.queue.length;
            },

            /**
             * Returns the notification at the specified index or null if none was found.
             * @param {number} index - The zero-based index of the notification in the queue.
             * @returns {Object} - The notification.
             */
            getNotificationAt: function(index) {
                return this.queue[index] || null;
            },

            /**
             * Returns the next (newer) notification in the queue or null if there is no next.
             * @returns {Object} - The notification.
             */
            getNextNotification: function() {
                var newPos = this._queuePosition+1;
                if (this.queue[newPos]) {
                    return this.queue[newPos];
                }
                return null;
            },

            /**
             * Returns the previous (older) notification in the queue or null if there is no previous.
             * @returns {Object} - The notification.
             */
            getPreviousNotification: function() {
                var newPos = this._queuePosition-1;
                if (this.queue[newPos]) {
                    return this.queue[newPos];
                }
                return null;
            },

            /**
             * Returns the newest notification by date that is currently in the queue or null if the queue is empty.
             * @returns {Object} - The notification.
             */
            getNewestNotification: function() {
                if (this.queue.length > 0) {
                    return this.queue[this.queue.length-1];
                }
                return null;
            },

            /**
             * Returns the oldest notification by date that is currently in the queue or null if the queue is empty.
             * @returns {Object} - The notification.
             */
            getOldestNotification: function() {
                if (this.queue.length > 0) {
                    return this.queue[0];
                }
                return null;
            },

            /**
             * Removes the specified notification from the queue.
             * @param {Object} notification - The notification to be removed.
             * @returns {boolean} - Indicates if the notification was removed successfully.
             */
            removeNotification: function(notification) {
                var index = this.queue.indexOf(notification);
                if (index > -1) {
                    var cancelled = _fireEvent('beforeQueueUpdated',{"op":"del","notification":notification,"queue":this.queue.slice(0)},true);
                    if (cancelled) {
                        return false;
                    }
                    //if we have an id it means the notification is stored in the
                    //mailbox service so we will delete it from the user's mail
                    if (this.queue[index][VOYENT_MAIL_QUERY_PARAMETER]) {
                        _removeNotificationFromMailbox(this.queue[index][VOYENT_MAIL_QUERY_PARAMETER]);
                    }
                    this._queue.splice(index,1);
                    _fireEvent('afterQueueUpdated',{"op":"del","notification":notification,"queue":this.queue.slice(0)},false);
                    return true;
                }
                return false;
            },

            /**
             * Removes the notification from the queue at the specified index.
             * @param {number} index - The zero-based index of the notification in the queue.
             * @returns {boolean} - Indicates if the notification was removed successfully.
             */
            removeNotificationAt: function(index) {
                var notification = this.queue[index];
                if (notification) {
                    var cancelled = _fireEvent('beforeQueueUpdated',{"op":"del","notification":notification,"queue":this.queue.slice(0)},true);
                    if (cancelled) {
                       return false;
                    }
                    //if we have an id it means the notification is stored in the
                    //mailbox service so we will delete it from the user's mail
                    if (notification[VOYENT_MAIL_QUERY_PARAMETER]) {
                        _removeNotificationFromMailbox(notification[VOYENT_MAIL_QUERY_PARAMETER]);
                    }
                    this._queue.splice(index,1);
                    _fireEvent('afterQueueUpdated',{"op":"del","notification":notification,"queue":this.queue.slice(0)},false);
                    return true;
                }
                return false;
            },

            /**
             * Removes the selected notification. If successful the queuePosition will be reset to -1 indicating that no
             * notification is currently selected.
             * @returns {boolean} - Indicates if the notification was removed successfully.
             */
            removeSelectedNotification: function() {
                if (!this.selected) {
                    return false; //nothing to remove
                }
                var notification = this.queue[this._queuePosition];
                var cancelled = _fireEvent('beforeQueueUpdated',{"op":"del","notification":notification,"queue":this.queue.slice(0)},true);
                if (cancelled) {
                    return false;
                }
                //remove the notification from the queue
                this._queue.splice(this._queuePosition,1);
                this._queuePosition = -1;
                _fireEvent('afterQueueUpdated',{"op":"del","notification":notification,"queue":this.queue.slice(0)},false);
                //reset the selected property
                //if we have an id it means the notification is stored in the
                //mailbox service so we will delete it from the user's mail
                if (this.selected[VOYENT_MAIL_QUERY_PARAMETER]) {
                    _removeNotificationFromMailbox(this.selected[VOYENT_MAIL_QUERY_PARAMETER]);
                }
                this._selected = null;
                _setSelectedNotificationInStorage();
                _fireEvent('notificationChanged',{"notification":this.selected},false);
                _autoSelectNotification();
                return true;
            },

            /**
             * Removes all notifications from the notification queue (including clearing the selected notification) and
             * resets the queuePosition to -1.
             */
            clearNotificationQueue: function() {
                if (!this.queue || this.queue.length === 0) {
                    return; //queue is already empty
                }
                var cancelled = _fireEvent('beforeQueueUpdated',{"op":"clear","queue":this.queue.slice(0)},true);
                if (cancelled) {
                    return;
                }
                for (var i=0; i<this.queue.length; i++) {
                    if (this.queue[i][VOYENT_MAIL_QUERY_PARAMETER]) {
                        _removeNotificationFromMailbox(this.queue[i][VOYENT_MAIL_QUERY_PARAMETER]);
                    }
                }
                this._queue = [];
                this._queuePosition = -1;
                _fireEvent('afterQueueUpdated',{"op":"clear","queue":this.queue.slice(0)},false);
                //clear the selected notification
                if (this._selected) {
                    this._selected = null;
                    _setSelectedNotificationInStorage();
                    _fireEvent('notificationChanged',{"notification":this.selected},false);
                }
            },

            /**
             * Redirects the browser to the URL specified in the passed notification and injects the notification data into the page.
             * @param {Object} notification - The notification that determines where to redirect.
             */
            redirectToNotification: function(notification) {
                if (!notification.url) {
                    return;
                }
                //save the notification to inject in session storage so it survives the redirect
                this._selected = notification;
                _setSelectedNotificationInStorage();
                //redirect browser
                window.location.replace(notification.url);
            },

            /**
             * Injects the selected notification into elements with data-selected-* attributes.
             * Currently has special support for input and select elements. For all other elements the data
             * will be inserted as text content.
             */
            injectNotificationData: function() {
                _injectOrClearNotficationData(false);
            },

            /**
             * Removes all injected notification data from the page.
             */
            clearInjectedNotificationData: function() {
                _injectOrClearNotficationData(true);
            },

            /**
             * Sets the selected notification to the one passed if it is a valid notification in the queue.
             * @param {Object} notification - The notification object to be set.
             * @returns {boolean} - Indicates if the notification was set successfully.
             */
            selectNotification: function(notification) {
                var i = this.queue.indexOf(notification);
                if (i > -1) {
                    if (this.selected !== notification) {
                        this._selectNotification(notification,i);
                    }
                }
                else if (typeof notification.nid !== 'undefined') {
                    //In some cases, such as when loading a notification from storage, the object may actually
                    //be different than the one in the queue even though it refers to the same notification. In these
                    //cases we will fallback to checking the nid on the notification to look for a match.
                    for (i=0; i<this.queue.length; i++) {
                        if (this.queue[i].nid === notification.nid &&
                            this.selected !== this.queue[i]) {
                            this._selectNotification(this.queue[i],i);
                            return true;
                        }
                    }
                }
                return false;
            },

            /**
             * Sets the selected notification to the one in the queue at the specified index.
             * @param {number} index - The zero-based index of the notification in the queue.
             * @returns {boolean} - Indicates if the notification was set successfully.
             */
            selectNotificationAt: function(index) {
                var notification = this.queue[index];
                if (notification && notification !== this.selected) {
                    this._selectNotification(notification,index);
                    return true;
                }
                return false;
            },

            /**
             * Selects the passed notification.
             * @param notification
             * @param index
             * @private
             */
            _selectNotification: function(notification,index) {
                this._selected = notification;
                this._queuePosition = index;
                _setSelectedNotificationInStorage();
                _fireEvent('notificationChanged',{"notification":this.selected},false);
            },

            /**
             * Displays the passed notification as a toast or browser native notification, depending on the current
             * configuration. Can be used to re-display a notification from the queue or even to display a custom
             * notification that is not part of the queue.
             * @param {object} notification - The notification to display.
             */
            displayNotification: function (notification) {
                if (notify.config.native.enabled && window.Notification && Notification.permission === 'granted') {
                    _displayNativeNotification(notification);
                }
                else if (notify.config.toast.enabled) {
                    _displayToastNotification(notification);
                }
            },

            /**
             * Manually hides a notification.
             * @param {Object} notification - A toast or browser native notification reference.
             * @param {number} ms - The number of milliseconds to wait before hiding the notification.
             */
            hideNotification: function(notification,ms) {
                if (!notification || !notification.constructor) {
                    return;
                }
                setTimeout(function() {
                    if (notification.constructor === HTMLDivElement) { //toast notification
                        //hide the toast via transform and opacity changes
                        var hideTranslateY = notify.config.toast.position.indexOf('bottom') > -1 ? TOAST_Y_POS : -Math.abs(TOAST_Y_POS);
                        notification.style.opacity = '0';
                        notification.style.transform = 'translateY('+hideTranslateY+'px)';
                        notification.style.webkitTransform = 'translateY('+hideTranslateY+'px)';
                        setTimeout(function() {
                            if (document.getElementById(VOYENT_TOAST_CONTAINER_ID).contains(notification)) {
                                document.getElementById(VOYENT_TOAST_CONTAINER_ID).removeChild(notification);
                                _updateDisplayedNotifications(notification);
                            }
                        },400); //transition effect is for 300ms so remove the toast from the DOM after 400ms
                    }
                    else if (notification.constructor === Notification) { //native notification
                        notification.close();
                    }
                },typeof ms !== 'number' ? 0 : Math.round(ms));
            }
        };
    }

    //******************************************************************************************************************
    //************************************************** PRIVATE API ***************************************************
    //******************************************************************************************************************

    var TOAST_Y_POS = 100; //the starting vertical position of toast notifications from the top or bottom of the page
    var _displayedToasts=[]; //list of the currently displayed toast notifications
    var _queuedToasts=[]; //list of the queued notifications (notifications waiting to display)
    var _validPriorities=['info','critical']; //list of priorities that we will generate an icon for
    var _iconURL = 'https://raw.githubusercontent.com/Voyent/voyent.notify.js/master/lib/icons/';
    var _isInitialized = false; //Indicates if voyentNotifyInitialized has fired.

    /**
     * Setup the push listener. If this the first init then we'll also install the toast container, request
     * native notification permissions, inject notifications after redirects, load the notification queue from
     * session storage and get saved notifications from user's mailboxes.
     * @private
     */
    function _setupListeners() {
        notify.startListening();
        if (!_isInitialized) {
            //fire the initialization event if we are actively listening for notifications
            if (notify._listener) {
                _fireEvent('voyentNotifyInitialized',{"config":notify.config},false);
                _isInitialized = true;
            }

            //add our custom toast parent element to the page
            if (notify.config.toast.enabled && !document.getElementById(VOYENT_TOAST_CONTAINER_ID)) {
                _createToastContainer();
            }

            //check for desktop notification support and request permission
            if (notify.config.native.enabled && _isNewNotificationSupported()) {
                Notification.requestPermission(function(permission){});
            }

            //get unread notifications from the mailbox service
            var params = window.location.search;
            var begIndexMailId = params.indexOf(VOYENT_MAIL_QUERY_PARAMETER);
            if (begIndexMailId > -1) {
                var nid = new RegExp( '[?&]' + VOYENT_MAIL_QUERY_PARAMETER + '=([^&#]*)', 'i' ).exec(params);
                if (nid && nid[1]) { nid = nid[1]; }

                //remove query param from URL so the browser doesn't fetch the mail again on reload
                if (window.history && history.pushState) {
                    //get the VOYENT_MAIL_QUERY_PARAMETER and any trailing parameters
                    var slicedString = params.slice(begIndexMailId);
                    //remove the parameter
                    params = params.replace(slicedString.slice(0,slicedString.indexOf('&') > -1 ? slicedString.indexOf('&') : slicedString.length),'');
                    //clear params if the only parameter was the one we removed
                    if (params === '?') {
                        params = '';
                    }
                    else {
                        //cleanup extra characters that may be leftover
                        params = params.replace('?&','?').replace('&&','&');
                        //remove trailing '&' character that will be left if we removed from the end of the string
                        if (params.charAt(params.length-1) === '&') {
                            params = params.slice(0,params.length-1);
                        }
                    }
                    //form the new url with the modified query params
                    var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + params + window.location.hash;
                    //update the browser history / url
                    window.history.pushState({path:newurl},'',newurl);
                }
            }
            notify.refreshNotificationQueue(nid);
        }
    }

     /**
     * Convenience function for firing an event.
     * @param {string} name - The name of the event.
     * @param {Object} detail - An object containing the data for the event.
     * @param {boolean} cancelable - Indicates if the event can be canceled or not.
     * @returns {boolean} - Indicates if the event was cancelled in at least one of the listening event handlers.
     * @private
     */
    function _fireEvent(name,detail,cancelable) {
        var event = new CustomEvent(name,{"detail":detail,"bubbles":false,"cancelable":!!cancelable});
        return !document.dispatchEvent(event);
    }

    /**
     * Handles auto selecting the notification in the queue.
     * @private
     */
    function _autoSelectNotification() {
        switch (notify.config.autoSelectNotification) {
            case 'oldest':
                notify.selectNotification(notify.getOldestNotification());
                break;
            case 'newest':
                notify.selectNotification(notify.getNewestNotification());
        }
    }

    /**
     * Parses the notification into the browser specific notification format.
     * @param {Object} notification - The notification to parse.
     * @returns {boolean} - Indicates if the notification was parsed successfully.
     * @private
     */
    function _parseNotificationForBrowser(notification) {
        try {
            var key;
            //overwrite global properties with browser properties
            for (key in notification.browser) {
                if (!notification.browser.hasOwnProperty(key)) {
                    continue;
                }
                notification.global[key] = notification.browser[key];
            }
            delete notification.browser;
            //move properties out of the global property
            for (key in notification.global) {
                if (!notification.global.hasOwnProperty(key)) {
                    continue;
                }
                notification[key] = notification.global[key];
            }
            delete notification.global;
            //delete unused transports
            delete notification.cloud;
            delete notification.email;
            delete notification.sms;

        }
        catch (e) {
            return false;
        }
        return true;
    }

    /**
     * Displays a browser native notification.
     * @param {Object} notification - The notification to display.
     * @private
     */
    function _displayNativeNotification(notification) {
        var cancelled = _fireEvent('beforeDisplayNotification',{"notification":notification},true);
        if (cancelled) {
            return;
        }
        //configure the notification options
        var opts = {
            body:notification.detail
        };
        if (notification.icon && notification.icon.trim().length > 0) {
            opts.icon = notification.icon;
        }
        //display the notification
        var subject = notification.subject || '';
        var n = new Notification(subject,opts);
        //add onclick listener with default behaviour of redirecting
        n.onclick = function() {
            var cancelled = _fireEvent('notificationClicked',{"notification":notification,"native":n},true);
            if (notify.config.hideAfterClick) {
                notify.hideNotification(n,0);
            }
            if (cancelled) {
                return;
            }
            notify.redirectToNotification(notification);
        };
        //add onclose listener
        n.onclose = function() {
            _fireEvent('notificationClosed',{"notification":notification,"native":n},false);
        };
        //add onshow listener for hiding the notifications after they are shown
        n.onshow = function() {
            _fireEvent('afterDisplayNotification',{"notification":notification,"native":n},false);
            //We use the onshow handler for hiding the notifications because in some browsers (like Chrome)
            //only three notifications are displayed at one time. If there are more than three notifications to show
            //then they will be queued in the background until they have room to be displayed. We only want to start
            //the hide timeout after they are actually shown on the page and not just added to the queue.
            if (notify.config.native.hideAfterMs > 0) {
                notify.hideNotification(n, notify.config.native.hideAfterMs);
            }
        };
    }

    /**
     * Determines if we should display a toast notification or add it to the queue to display later.
     * @param notification
     * @private
     */
    function _displayToastNotification(notification) {
        var cancelled = _fireEvent('beforeDisplayNotification',{"notification":notification},true);
        if (cancelled) {
            return;
        }
        //ensure we have the notification container in the DOM
        if (!document.getElementById(VOYENT_TOAST_CONTAINER_ID)) {
            _createToastContainer();
        }
        //setup new div for toast notification
        var toast = document.createElement('div');
        _createToastChildren(toast,notification);
        _setToastStyle(toast);
        //add to DOM so we can determine the height of the notification
        document.getElementById(VOYENT_TOAST_CONTAINER_ID).appendChild(toast);
        //display or queue the notification depending on the stack
        setTimeout(function() {
            //display toast if there is room in the stack or there is no stack limit
            if ((notify.config.toast.stackLimit > _displayedToasts.length) || notify.config.toast.stackLimit <= 0) {
                _displayToast({"notification":notification,"toast":toast});
            }
            else {
                //since we can't add to stack, add to queue
                _queuedToasts.push({"notification":notification,"toast":toast});
                if (notify.config.toast.overwriteOld) {
                    //replace oldest notification
                    notify.hideNotification(_displayedToasts[0],0);
                }
            }
        },0);
    }

    /**
     * Displays a toast notification.
     * @param {Object} notificationData - An object containing a reference to the notification object and toast DOM element.
     */
    function _displayToast(notificationData) {
        //determine the y position where the new toast should be displayed
        var yPosition = 0;
        for (var i=0; i<_displayedToasts.length; i++) {
            var height = _displayedToasts[i].offsetHeight;
            yPosition += height+notify.config.toast.spacing;
            //store height for later use if we haven't already set it
            if (!_displayedToasts[i].getAttribute('data-height')) {
                _displayedToasts[i].setAttribute('data-height',height.toString());
            }
        }
        //the y position will need to be negated if we are rendering the toast from the bottom of the page
        var trueYPosition = notify.config.toast.position.indexOf('bottom') > -1 ? (-Math.abs(yPosition)) : yPosition;
        notificationData.toast.style.opacity = 1;
        notificationData.toast.style.transform = 'translateY('+trueYPosition+'px)';
        notificationData.toast.style.webkitTransform = 'translateY('+trueYPosition+'px)';
        notificationData.toast.setAttribute('data-translate-y',yPosition.toString()); //store absolute y position for later use
        //store a reference to the toast
        _displayedToasts.push(notificationData.toast);
        //remove the toast from the queue
        var index = _queuedToasts.indexOf(notificationData);
        if (index > -1) {
            _queuedToasts.splice(index,1);
        }
        //hide the notification after set timeout
        if (notify.config.toast.hideAfterMs > 0) {
            notify.hideNotification(notificationData.toast,notify.config.toast.hideAfterMs);
        }
        _fireEvent('afterDisplayNotification',{"notification":notificationData.notification,"toast":notificationData.toast},false);
    }

    /**
     * Handles sliding notifications in the stack up or down as notifications are removed from the stack.
     * @param {Object} toast - The toast DOM element that was just removed from the stack.
     * @private
     */
    function _updateDisplayedNotifications(toast) {
        //check if we need to slide any notifications up, if the last notification
        //closed was in the last position then we don't need to slide
        var index = _displayedToasts.indexOf(toast);
        if (index > -1 && index !== _displayedToasts.length-1) {
            var isBottom = notify.config.toast.position.indexOf('bottom') > -1;
            //slide all notifications after the one that is being removed
            for (var i=index+1; i<_displayedToasts.length; i++) {
                var toastToSlide = _displayedToasts[i];
                var yPosition;
                //account for spacing between toasts
                var paddingMultiplier = index === 0 ? 1 : index;
                var padding = notify.config.toast.spacing * paddingMultiplier;
                if (isBottom) { //slide down
                    yPosition = parseInt(toastToSlide.getAttribute('data-translate-y')) +
                                parseInt(toast.getAttribute('data-height')) + padding;
                }
                else { //slide up
                    yPosition = parseInt(toastToSlide.getAttribute('data-translate-y')) -
                                parseInt(toast.getAttribute('data-height')) - padding;
                }
                //the y position will need to be negated if we are rendering the toast from the bottom of the page
                var trueYPosition = isBottom ? (-Math.abs(yPosition)) : yPosition;
                //slide the toast
                toastToSlide.style.transform = 'translateY('+trueYPosition+'px)';
                toastToSlide.style.webkitTransform = 'translateY('+trueYPosition+'px)';
                //updated the stored absolute y position
                toastToSlide.setAttribute('data-translate-y',yPosition);
            }
        }
        //keep the list of displayed toasts in sync
        var toastIndex = _displayedToasts.indexOf(toast);
        if (toastIndex > -1) {
            _displayedToasts.splice(toastIndex,1);
        }
        //display the next notification in the queue
        var nextToast = _queuedToasts[0];
        if (nextToast) {
            _displayToast(nextToast);
        }
    }

    /**
     * Creates the toast notification container.
     * @private
     */
    function _createToastContainer() {
        waitForBody();
        function waitForBody() {
            if (!document || !document.body) {
                setTimeout(waitForBody,100);
                return;
            }
            var div = document.createElement('div');
            div.id = VOYENT_TOAST_CONTAINER_ID;
            document.body.appendChild(div);
        }
    }

    /**
     * Adds child elements to the toast DOM element.
     * @param {Object} toast - The toast DOM element container.
     * @param {Object} notification - The notification to be rendered inside the toast.
     * @private
     */
    function _createToastChildren(toast,notification) {
        //add close button, if enabled
        if (notify.config.toast.close.enabled) {
            var closeDiv = document.createElement('div');
            closeDiv.className = 'close';
            closeDiv.style.float = 'right';
            closeDiv.style.fontSize = '15px';
            closeDiv.style.color = '#888888';
            closeDiv.style.cursor = 'pointer';
            closeDiv.style.marginTop = '-10px';
            closeDiv.style.marginBottom = '-10px';
            //append user's custom styling
            closeDiv.setAttribute('style',closeDiv.getAttribute('style')+notify.config.toast.close.style);
            //add X character
            closeDiv.innerHTML = '&#10006;';
            //add onclick listener with default behaviour of closing the notification
            closeDiv.onclick = function() {
                var cancelled = _fireEvent('notificationClosed',{"notification":notification,"toast":toast},true);
                if (cancelled) {
                    return;
                }
                notify.hideNotification(toast,0);
            };
            toast.appendChild(closeDiv);

            //add clear float
            var clearClose = document.createElement('div');
            clearClose.style.clear = 'both';
            toast.appendChild(clearClose);
        }
        //add icon, if provided
        if ((notification.icon && notification.icon.trim().length > 0) ||
            (notification.priority && _validPriorities.indexOf(notification.priority) > -1)) {

            var iconDiv = document.createElement('div');
            iconDiv.className = 'icon';
            iconDiv.style.maxWidth = '40px';
            iconDiv.style.marginRight = '10px';
            iconDiv.style.float = 'left';

            var icon = document.createElement('img');
            icon.src = _getIconSrc(notification);
            icon.style.display = 'block';
            icon.style.height = '100%';
            icon.style.width = '100%';
            iconDiv.appendChild(icon);
            toast.appendChild(iconDiv);
        }
        //add subject, if provided
        if (notification.subject && notification.subject.trim().length > 0) {
            var titleDiv = document.createElement('div');
            titleDiv.className = 'subject';
            titleDiv.style.fontSize = '16px';
            titleDiv.style.fontWeight = 'bold';
            titleDiv.style.marginBottom = '5px';
            titleDiv.innerHTML = notification.subject;
            toast.appendChild(titleDiv);
        }

        //add message
        var msgDiv = document.createElement('div');
        msgDiv.className = 'message';
        msgDiv.style.overflow = 'hidden';
        msgDiv.style.cursor = 'pointer';
        msgDiv.style.wordBreak = 'break-word';
        msgDiv.innerHTML = notification.detail;
        //add onclick listener with default behaviour of redirecting
        msgDiv.onclick = function() {
            var cancelled = _fireEvent('notificationClicked',{"notification":notification,"toast":toast},true);
            if (notify.config.hideAfterClick) {
                notify.hideNotification(toast,0);
            }
            if (cancelled) {
                return;
            }
            notify.redirectToNotification(notification);
        };
        toast.appendChild(msgDiv);

        //add clear float
        var clearDiv = document.createElement('div');
        clearDiv.style.clear = 'left';
        toast.appendChild(clearDiv);
    }

    /**
     * Returns a URL that references the notification icon image.
     * @param notification - The notification that the image will be rendered for.
     * @returns {string} - The URL of the image.
     * @private
     */
    function _getIconSrc(notification) {
        return notification.icon && notification.icon.trim().length > 0 ? notification.icon : _iconURL+notification.priority+'.png'
    }

    /**
     * Sets the styling for the toast notification.
     * @param {Object} toast - The toast DOM element container that styling should be set for.
     * @private
     */
    function _setToastStyle(toast) {
        //default styling
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

        //styling specific to the position configuration
        switch (notify.config.toast.position) {
            case 'top-right':
                toast.style.right = '0';
                toast.style.top = '0';
                toast.style.transform = 'translateY('+(-Math.abs(TOAST_Y_POS))+'px)';
                toast.style.webkitTransform = 'translateY('+(-Math.abs(TOAST_Y_POS))+'px)';
                break;
            case 'bottom-right':
                toast.style.right = '0';
                toast.style.bottom = '0';
                toast.style.transform = 'translateY('+TOAST_Y_POS+'px)';
                toast.style.webkitTransform = 'translateY('+TOAST_Y_POS+'px)';
                break;
            case 'top-left':
                toast.style.left = '0';
                toast.style.top = '0';
                toast.style.transform = 'translateY('+(-Math.abs(TOAST_Y_POS))+'px)';
                toast.style.webkitTransform = 'translateY('+(-Math.abs(TOAST_Y_POS))+'px)';
                break;
            case 'bottom-left':
                toast.style.left = '0';
                toast.style.bottom = '0';
                toast.style.transform = 'translateY('+TOAST_Y_POS+'px)';
                toast.style.webkitTransform = 'translateY('+TOAST_Y_POS+'px)';
                break;
            default:
                //default to top-right
                toast.style.right = '0';
                toast.style.top = '0';
                toast.style.transform = 'translateY('+(-Math.abs(TOAST_Y_POS))+'px)';
                toast.style.webkitTransform = 'translateY('+(-Math.abs(TOAST_Y_POS))+'px)';
        }
        //append user's custom styling
        toast.setAttribute('style',toast.getAttribute('style')+notify.config.toast.style);
    }

    /**
     * Searches for relevant DOM elements that notification data should be injected or cleared on.
     * @param {boolean} doClear - Determines if the notification data should be injected or cleared.
     * @private
     */
    function _injectOrClearNotficationData (doClear) {
        var key, elements, i;
        var findElements = function(obj,keys) {
            for (key in obj) {
                if (!obj.hasOwnProperty(key)) {
                    continue;
                }
                var val = obj[key];
                if (typeof val !== 'object') {
                    //build the selector
                    var selector = 'data-selected-' + (keys.length ? keys.join('-') + '-' + key : key);
                    //find all matching DOM elements
                    elements = document.querySelectorAll('['+selector+']');
                    //inject the data for each element
                    for (i=0; i<elements.length; i++) {
                        val = (selector === 'data-selected-time') ? new Date(val) : val;
                        _injectOrClearDataForType(elements[i],val,doClear);
                    }
                }
                else {
                    //we may need to inject sub properties of this object
                    findElements(val,keys.concat([key]));
                }
            }
        };
        if (notify.selected) {
            findElements(notify.selected,[]);
        }
    }

    /**
     * Injects or clears data data in a way specific to the type of DOM element.
     * @param {Object} element - The element to inject or clear notification data on.
     * @param {Object} data - The data to inject, if applicable.
     * @param {boolean} doClear - Determines if the notification data should be injected or cleared.
     * @private
     */
    function _injectOrClearDataForType (element,data,doClear) {
        switch (element.tagName) {
            case 'INPUT':
                //set the input value
                element.value = doClear ? '' : data;
                break;
            case 'SELECT':
                //only proceed if we have an actual Array
                if (!Array.isArray(data)) {
                    return;
                }
                //always clear out the select of any old options
                element.value = '';
                while (element.options.length) { element.remove(0); }
                if (doClear) {
                    //nothing else to do
                    return;
                }
                for (var i=0; i<data.length; i++) {
                    //generate select options for array elements
                    var opt = document.createElement("option");
                    //support objects with value and label properties
                    opt.value = data[i].value || data[i];
                    opt.textContent = data[i].label || data[i];
                    element.appendChild(opt);
                }
                break;
            default:
                //for all other cases just set the text content of the element
                element.textContent = doClear ? '' : data;
        }
    }

    /**
     * Determines if the browser supports the Notification constructor.
     * @returns {boolean} - Indicates if "new Notification()" is supported.
     * @private
     */
    function _isNewNotificationSupported() {
        if (window.Notification && Notification.requestPermission) {
            if (Notification.permission === 'granted') {
                return true;
            }
        }
        else {
            return false;
        }
        //Special case below for Android Chrome since it doesn't currently support non-persistent notifications
        //https://bugs.chromium.org/p/chromium/issues/detail?id=481856
        //Eventually it would be nice to support persistent (ServiceWorkerRegistration) Notifications
        try {
            new Notification('');
        } catch (e) {
            if (e.name === 'TypeError') {
                return false;
            }
        }
        return true;
    }

    /**
     * Removes a saved notification from the user's mailbox.
     * @param {string} id - The id of the saved notification.
     * @private
     */
    function _removeNotificationFromMailbox(id) {
        //if we have an id then this means the notification is
        //also stored in the mailbox service so we will delete it
        var query = {}; query[VOYENT_MAIL_QUERY_PARAMETER] = id;
        v.mailbox.deleteMessages({"username":v.auth.getLastKnownUsername(),
                                     "query":query}).then(function() {
        }).catch(function(e) {
            _fireEvent('message-error','Error deleting notification: ' +
                      (e.responseText || e.message || e), false);
        });
    }

    /**
     * Returns a notification from the queue that matches the passed notification
     * by comparing the VOYENT_MAIL_QUERY_PARAMETER property.
     * @param notification - The notification to compare against the queue.
     * @returns {Object} - The matching notification in the queue.
     * @private
     */
    function _getNotificationByNid(notification) {
        //loop backwards through the queue since it's most
        //likely any duplicate notifications were just added
        for (var i=notify._queue.length-1; i >= 0; i--) {
            if (notify._queue[i][VOYENT_MAIL_QUERY_PARAMETER] === notification[VOYENT_MAIL_QUERY_PARAMETER]) {
                return notify._queue[i];
            }
        }
        return null;
    }

    /**
     * Stores the nid of the selected notification in session storage.
     * @private
     */
    function _setSelectedNotificationInStorage() {
        var injectKey = VOYENT_INJECT_KEY+'_'+v.auth.getLastKnownUsername();
        if (!notify.selected || !notify.selected.nid) {
            v.$.removeSessionStorageItem(btoa(injectKey));
        }
        else {
            v.$.setSessionStorageItem(btoa(injectKey),btoa(JSON.stringify(notify.selected.nid)));
        }
    }

    /**
     * Retrieves the nid of the selected notification from session storage.
     * @returns {Object} - The selected notification.
     * @private
     */
    function _getSelectedNidFromStorage() {
        var injectKey = VOYENT_INJECT_KEY+'_'+v.auth.getLastKnownUsername();
        var base64Notification = v.$.getSessionStorageItem(btoa(injectKey));
        return base64Notification ? JSON.parse(atob(base64Notification)) : null;
    }

})(voyent);

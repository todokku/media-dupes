'use strict'

// ----------------------------------------------------------------------------
// IMPORT
// ----------------------------------------------------------------------------
const utils = require('./js/modules/mdUtils.js')

// ----------------------------------------------------------------------------
// ERROR HANDLING
// ----------------------------------------------------------------------------
const errorReporting = require('./js/errorReporting.js')
// myUndefinedFunctionFromRenderer();

// ----------------------------------------------------------------------------
// VARIABLES
// ----------------------------------------------------------------------------
var arrayUserUrls = [] // contains the urls which should be downloaded
var arrayUrlsThrowingErrors = [] // coontains urls which throws errors while trying to download

// Settings variables
var settingAudioFormat = 'mp3' // default is set to mp3
var settingCustomDownloadDir = '' // default
var settingEnableErrorReporting = true
var ytdlBinaryVersion = '0.0.0'

/**
* @name titlebarInit
* @summary Init the titlebar for the frameless mainWindow
* @description Creates a custom titlebar for the mainWindow using custom-electron-titlebar (https://github.com/AlexTorresSk/custom-electron-titlebar).
*/
function titlebarInit () {
    // NOTE:
    // there exists:
    // - 'custom-electron-titlebar'
    // - 'pj-custom-electron-titlebar' (fork)
    //
    const customTitlebar = require('custom-electron-titlebar')
    // const customTitlebar = require('pj-custom-electron-titlebar')

    const myTitlebar = new customTitlebar.Titlebar({
        titleHorizontalAlignment: 'center', // position of window title
        icon: 'img/icon/icon.png',
        drag: true, // whether or not you can drag the window by holding the click on the title bar.
        backgroundColor: customTitlebar.Color.fromHex('#171717'),
        minimizable: true,
        maximizable: true,
        closeable: true,
        itemBackgroundColor: customTitlebar.Color.fromHex('#525252') // hover color
    })

    // Be aware: the font-size of .window-title (aka application name) is set by app/css/core.css
    doLogToConsole('info', 'titlebarInit ::: Initialized custom titlebar')
}

/**
* @name doUpdateYoutubeDLBinary
* @summary Update the youtube-dl binary to latest version
* @description Updates the youtube-dl-binary in a custom set path to the latest version.
*/
function doUpdateYoutubeDLBinary () {
    // get path of youtube-dl binary
    const youtubedl = require('youtube-dl')
    const downloader = require('youtube-dl/lib/downloader')
    const remote = require('electron').remote
    const app = remote.app
    const path = require('path')
    const userDataPath = path.join(app.getPath('userData'), 'youtube-dl')

    doLogToConsole('info', 'doUpdateYoutubeDLBinary ::: Searching youtube-dl binary')
    var youtubeDlBinaryPath = youtubedl.getYtdlBinary()
    doLogToConsole('info', 'doUpdateYoutubeDLBinary ::: Found youtube-dl binary in: _' + youtubeDlBinaryPath + '_.')

    // start downloading latest youtube-dl binary to custom path
    downloader(userDataPath, function error (err, done) {
        'use strict'
        if (err) {
            doLogToConsole('error', 'doUpdateYoutubeDLBinary ::: Error while trying to update the youtube-dl binary at: _' + userDataPath + '_. Error: ' + err)
            showNoty('error', 'Unable to update youtube-dl binary. Error: ' + err, 0)
            throw err
        }
        doLogToConsole('info', 'doUpdateYoutubeDLBinary ::: Updated youtube-dl binary at: _' + userDataPath + '_.')
        console.log(done)
        showNoty('success', done)
    })
}

/**
* @name doLogToConsole
* @summary Writes console output for the renderer process
* @description Writes console output for the renderer process
* @param type - String which defines the log type
* @param message - String which defines the log message
*/
function doLogToConsole (type, message) {
    const prefix = '[ Renderer ] '
    const log = require('electron-log')
    // electron-log can: error, warn, info, verbose, debug, silly
    switch (type) {
    case 'info':
        log.info(prefix + message)
        break

    case 'warn':
        log.warn(prefix + message)
        break

    case 'error':
        log.error(prefix + message)
        break

    default:
        log.silly(prefix + message)
    }
}

/**
* @name showNoty
* @summary Shows a noty notification
* @description Creates an in-app notification using the noty framework
* @param type - Options: alert, success, warning, error, info/information
* @param message - notification text
* @param timeout - Timevalue, defines how long the message should be displayed. Use 0 for no-timeout
*/
function showNoty (type, message, timeout = 3000) {
    const Noty = require('noty')
    new Noty({
        type: type,
        timeout: timeout,
        theme: 'bootstrap-v4',
        layout: 'bottom',
        text: message
    }).show()
}

/**
* @name showNotifcation
* @summary Shows a desktop notification
* @description Shows a desktop notification
* @param title - The title of the desktop notification
* @param message - The notification message text
*/
function showNotifcation (title = 'media-dupes', message) {
    const myNotification = new Notification(title, {
        body: message,
        icon: 'img/notification/icon.png'
    })

    myNotification.onclick = () => {
        doLogToConsole('info', 'showNotification ::: Notification clicked')
    }
}

/**
* @name showDialog
* @summary Shows a dialog
* @description Displays a dialog
* @param dialogType - Can be "none", "info", "error", "question" or "warning"
* @param dialogTitle - The title text
* @param dialogMessage - The message of the dialog
* @param dialogDetail - The detail text
*/
function showDialog (dialogType, dialogTitle, dialogMessage, dialogDetail) {
    // Documentatiion: https://electronjs.org/docs/api/dialog
    const { dialog } = require('electron').remote

    const options = {
        type: dialogType,
        buttons: ['OK'],
        defaultId: 2,
        title: dialogTitle,
        message: dialogMessage,
        detail: dialogDetail
    }

    dialog.showMessageBox(null, options, (response, checkboxChecked) => {
        // doLogToConsole('info', response);
    })
}

/**
* @name uiLoadingAnimationShow
* @summary Shows the loading animation / download spinner
* @description Shows the loading animation / download spinner
*/
function uiLoadingAnimationShow () {
    doLogToConsole('info', 'uiLoadingAnimationShow ::: Showing spinner')
    $('#md_spinner').attr('hidden', false)
}

/**
* @name uiLoadingAnimationHide
* @summary Hides the loading animation / download spinner
* @description Hides the loading animation / download spinner
*/
function uiLoadingAnimationHide () {
    doLogToConsole('info', 'uiLoadingAnimationHide ::: Hiding spinner')
    $('#md_spinner').attr('hidden', true)
}

/**
* @name logScrollToEnd
* @summary Scrolls the UI log to the end / latest entry
* @description Scrolls the UI log to the end / latest entry
*/
function logScrollToEnd () {
    $('#textareaLogOutput').scrollTop($('#textareaLogOutput')[0].scrollHeight) // scroll log textarea to the end
}

/**
* @name logReset
* @summary Resets the content of the ui log
* @description Resets the content of the ui log
*/
function logReset () {
    document.getElementById('textareaLogOutput').value = ''
    doLogToConsole('info', 'logReset ::: Did reset the log-textarea')
}

/**
* @name logAppend
* @summary Appends text to the log textarea
* @description Appends text to the log textarea
*/
function logAppend (newLine) {
    $('#textareaLogOutput').val(function (i, text) {
        return text + newLine + '\n'
    })
    logScrollToEnd() // scroll log textarea to the end
}

/**
* @name checkForDeps
* @summary Checks for missing dependencies
* @description Checks on startup for missing dependencies (youtube-dl and ffmpeg). Both are bundles and should be find
*/
function checkForDeps () {
    var countErrors = 0

    // youtube-dl
    //
    const youtubedl = require('youtube-dl')
    var youtubeDl = youtubedl.getYtdlBinary()
    if (youtubeDl === '') {
        countErrors = countErrors + 1
        doLogToConsole('error', 'checkForDeps ::: Unable to find youtube-dl')
        $('#buttonStartVideoExec').hide() // hide video button
        $('#buttonStartVideo').hide() // hide video button
        $('#buttonStartAudioExec').hide() // hide audio button
        showNoty('error', 'Unable to find dependency <b>youtube-dl</b>. All download function are now disabled, sorry', 0)
    } else {
        doLogToConsole('info', 'checkForDeps ::: Found youtube-dl in: _' + youtubeDl + '_.')
    }

    // ffmpeg
    //
    var ffmpeg = require('ffmpeg-static-electron')
    if (ffmpeg === '') {
        countErrors = countErrors + 1
        doLogToConsole('error', 'checkForDeps ::: Unable to find ffmpeg')
        $('#buttonStartAudioExec').hide() // hide audio button
        showNoty('error', 'Unable to find dependency <b>ffmpeg</b>. Extracting audio is now disabled, sorry', 0)
    } else {
        doLogToConsole('info', 'checkForDeps ::: Found ffmpeg in: _' + ffmpeg.path + '_.')
    }

    doLogToConsole('info', 'checkForDeps ::: Finished checking dependencies. Found overall _' + countErrors + '_ problems.')
}

/**
* @name uiResetAskUser
* @summary Ask the user if he wants to execute the UI reset function
* @description Ask the user if he wants to execute the UI reset function
*/
function uiResetAskUser () {
    // confirm
    const Noty = require('noty')
    var n = new Noty(
        {
            theme: 'bootstrap-v4',
            layout: 'bottom',
            type: 'info',
            closeWith: [''], // to prevent closing the confirm-dialog by clicking something other then a confirm-dialog-button
            text: 'Do you really want to reset the UI?',
            buttons: [
                Noty.button('Yes', 'btn btn-success mediaDupes_btnDefaultWidth', function () {
                    n.close()
                    uiReset()
                },
                {
                    id: 'button1', 'data-status': 'ok'
                }),
                Noty.button('No', 'btn btn-secondary mediaDupes_btnDefaultWidth float-right', function () {
                    n.close()
                })
            ]
        })

    // show the noty dialog
    n.show()
}

/**
* @name uiReset
* @summary Resets the UI back to default
* @description Resets the UI back to default
*/
function uiReset () {
    doLogToConsole('info', 'uiReset ::: Starting to reset the UI')
    $('#inputNewUrl').val('') // empty the URL input field
    uiStartButtonsDisable() // disable start button
    uiOtherButtonsEnable() // ensure some buttons are enabled
    toDoListReset() // empty todo-list textarea
    logReset() // empty log textarea
    uiLoadingAnimationHide() // animation / spinner hide
    doLogToConsole('info', 'uiReset ::: Finished resetting the UI')
}

/**
* @name uiAllElementsDisable
* @summary Disables most UI elements to prevent execution of other user-triggered functions while a function is running
* @description Disables most UI elements to prevent execution of other user-triggered functions while a function is running
*/
function uiAllElementsDisable () {
    $('#inputNewUrl').prop('disabled', true) // url input field
    $('#buttonAddUrl').prop('disabled', true) // add url
    $('#buttonShowSettings').prop('disabled', true) // settings
    $('#buttonShowHelp').prop('disabled', true) // help / intro
    $('#buttonShowExtractors').prop('disabled', true) // showExtractors
    $('#buttonShowDownloadFolder').prop('disabled', true) // showDownloadFolder

    doLogToConsole('info', 'uiAllElementsDisable ::: Disabled all UI elements of the main UI')
}

/**
* @name uiAllElementsToDefault
* @summary Re-enables most UI elements
* @description Re-enables most UI elements
*/
function uiAllElementsToDefault () {
    $('#inputNewUrl').prop('disabled', false) // url input field
    $('#buttonAddUrl').prop('disabled', false) // add url
    $('#buttonShowSettings').prop('disabled', false) // settings
    $('#buttonShowHelp').prop('disabled', false) // help / intro
    $('#buttonShowExtractors').prop('disabled', false) // showExtractors
    $('#buttonShowDownloadFolder').prop('disabled', false) // showDownloadFolder

    doLogToConsole('info', 'uiAllElementsToDefault ::: Set all UI elements of the main UI back to default')
}

/**
* @name uiStartButtonsEnable
* @summary Enabled the 2 start buttons
* @description Is executed when the todo-list contains at least 1 item
*/
function uiStartButtonsEnable () {
    // enable start buttons
    $('#buttonStartVideoExec').prop('disabled', false)
    $('#buttonStartVideo').prop('disabled', false)
    $('#buttonStartAudioExec').prop('disabled', false)

    doLogToConsole('info', 'uiStartButtonsEnable ::: Did enable both start buttons')
}

/**
* @name uiStartButtonsDisable
* @summary Disables the 2 start buttons
* @description Is executed when a download task is started by the user
*/
function uiStartButtonsDisable () {
    // disable start buttons
    $('#buttonStartVideoExec').prop('disabled', true)
    $('#buttonStartVideo').prop('disabled', true)
    $('#buttonStartAudioExec').prop('disabled', true)

    doLogToConsole('info', 'uiStartButtonsDisable ::: Did disable both start buttons')
}

/**
* @name uiOtherButtonsEnable
* @summary Enables some of the footer buttons when a download is finished
* @description Is executed when a download task has ended by the user
*/
function uiOtherButtonsEnable () {
    // enable some buttons
    $('#inputNewUrl').prop('disabled', false) // url input field
    $('#buttonAddUrl').prop('disabled', false) // add url
    $('#buttonShowSettings').prop('disabled', false) // settings
    $('#buttonShowHelp').prop('disabled', false) // help / intro
    $('#buttonShowExtractors').prop('disabled', false) // showExtractors
    doLogToConsole('info', 'uiOtherButtonsEnable ::: Did enable some other UI elements')
}

/**
* @name uiOtherButtonsDisable
* @summary Disables some of the footer buttons while a download is running
* @description Is executed when a download task is started by the user
*/
function uiOtherButtonsDisable () {
    // disable some buttons
    $('#inputNewUrl').prop('disabled', true) // url input field
    $('#buttonAddUrl').prop('disabled', true) // add url
    $('#buttonShowSettings').prop('disabled', true) // settings
    $('#buttonShowHelp').prop('disabled', true) // help / intro
    $('#buttonShowExtractors').prop('disabled', true) // showExtractors
    doLogToConsole('info', 'uiOtherButtonsDisable ::: Did disable some other UI elements')
}

/**
* @name uiMakeUrgent
* @summary Tells the main process to mark the application as urgent (blinking in task manager)
* @description Is used to inform the user about an important state-change (all downloads finished). Triggers code in main.js which does the actual work
*/
function uiMakeUrgent () {
    // make window urgent after having finished downloading. See #7
    const { ipcRenderer } = require('electron')
    ipcRenderer.send('makeWindowUrgent')
}

/**
* @name settingsSelectCustomTargetDir
* @summary Let the user choose a custom download target directory
* @description Is triggered via button on settings.html.
*/
function settingsSelectCustomTargetDir () {
    const options = { properties: ['openDirectory'] }
    const { dialog } = require('electron').remote

    doLogToConsole('info', 'settingsSelectCustomTargetDir ::: User wants to set a custom download directory. Now opening dialog to select a new download target')
    dialog.showOpenDialog(options).then(res => {
        doLogToConsole('warn', '_' + res.filePaths + '_')

        if (res.filePaths.length === 0) {
            doLogToConsole('warn', 'settingsSelectCustomTargetDir ::: User aborted selecting a custom download directory path in settings')
            showNoty('warning', 'You aborted the definition of a custom download directory')
        } else {
            var newValue = res.filePaths.toString()
            writeLocalUserSetting('CustomDownloadDir', newValue) // save the value to user-config
            $('#inputCustomTargetDir').val(newValue) // show it in the UI
            doLogToConsole('info', 'settingsSelectCustomTargetDir ::: User selected the following directory: _' + newValue + '_.')
        }
    })
}

/**
* @name settingsResetCustomTargetDir
* @summary Let the user reset the custom download target directory
* @description Is triggered via button on settings.html.
*/
function settingsResetCustomTargetDir () {
    var newValue = ''
    writeLocalUserSetting('CustomDownloadDir', newValue) // save the value
    $('#inputCustomTargetDir').val(newValue) // show it in the UI
    settingCustomDownloadDir = newValue // update global var
    doLogToConsole('info', 'settingsResetCustomTargetDir ::: Resetted the custom download target.')
}

/**
* @name settingsBackToMain
* @summary Navigate back to index.html
* @description Is triggered via button on settings.html. Calls method on main.js which loads index.html back to the application window
*/
function settingsBackToMain () {
    // reload main UI
    const { ipcRenderer } = require('electron')
    ipcRenderer.send('mainUiLoad')
}

/**
* @name settingsUiLoad
* @summary Navigate to setting.html
* @description Is triggered via button on index.html. Calls method on main.js which loads setting.html to the application window
*/
function settingsUiLoad () {
    // load settings UI
    const { ipcRenderer } = require('electron')
    ipcRenderer.send('settingsUiLoad')
}

/**
* @name settingAudioFormatSave
* @summary Fetches the value from the audio-format select in the settings UI and triggers the update of the related user-settings-file
* @description Fetches the value from the audio-format select in the settings UI and triggers the update of the related user-settings-file
*/
function settingAudioFormatSave () {
    var userSelectedAudioFormat = $('#inputGroupSelectAudio').val() // get value from UI select inputGroupSelectAudio
    doLogToConsole('info', 'settingAudioFormatSave ::: User selected the audio format: _' + userSelectedAudioFormat + '_.')
    writeLocalUserSetting('AudioFormat', userSelectedAudioFormat) // store this value in a json file
}

/**
* @name settingsLoadAllOnAppStart
* @summary Reads all user-setting-files and fills some global variables
* @description Reads all user-setting-files and fills some global variables
*/
function settingsLoadAllOnAppStart () {
    readLocalUserSetting('CustomDownloadDir') // get setting for Custom download dir
    readLocalUserSetting('AudioFormat') // get setting for configured audio format
    readLocalUserSetting('enableErrorReporting')
}

/**
* @name settingsLoadAllOnSettingsUiLoad
* @summary Reads all user-setting-files and fills some global variables and adjusts the settings UI
* @description Reads all user-setting-files and fills some global variables and adjusts the settings UI
*/
function settingsLoadAllOnSettingsUiLoad () {
    readLocalUserSetting('CustomDownloadDir', true) // Custom download dir
    readLocalUserSetting('AudioFormat', true) // load configured audio format and update the settings UI
    readLocalUserSetting('enableErrorReporting', true)
}

/**
* @name settingsFolderOpen
* @summary Gets triggered from button on settings.html. Triggers code in main.js which opens the directory which contains possible user-settings-files
* @description Gets triggered from button on settings.html. Triggers code in main.js which opens the directory which contains possible user-settings-files
*/
function settingsFolderOpen () {
    doLogToConsole('info', 'settingsFolderOpen ::: User wants to open its config folder.')
    const { ipcRenderer } = require('electron')
    ipcRenderer.send('settingsFolderOpen')
}

/**
* @name writeLocalUserSetting
* @summary Write to electron-json-storage
* @description Writes a value for a given key to electron-json-storage
* @param key - Name of storage key
* @param value - New value
*/
function writeLocalUserSetting (key, value) {
    const storage = require('electron-json-storage')
    const remote = require('electron').remote
    const app = remote.app
    const path = require('path')

    // set new path for userUsettings
    const userSettingsPath = path.join(app.getPath('userData'), 'UserSettings')
    storage.setDataPath(userSettingsPath)

    // write the user setting
    storage.set(key, { setting: value }, function (error) {
        if (error) {
            throw error
        }
        doLogToConsole('info', 'writeLocalUserSetting ::: key: _' + key + '_ - new value: _' + value + '_')

        showNoty('success', 'Set <b>' + key + '</b> to <b>' + value + '</b>.')
    })
}

/**
* @name readLocalUserSetting
* @summary Read from local storage
* @description Reads a value stored in local storage (for a given key)
* @param key - Name of local storage key
* @param optional Boolean used for an ugly hack
*/
function readLocalUserSetting (key, optionalUpdateSettingUI = false) {
    const storage = require('electron-json-storage')
    const remote = require('electron').remote
    const app = remote.app
    const path = require('path')

    doLogToConsole('info', 'readLocalUserSetting ::: Trying to read value of key: _' + key + '_.')

    // change path for userSettings
    const userSettingsPath = path.join(app.getPath('userData'), 'UserSettings')
    storage.setDataPath(userSettingsPath)

    // read the json file
    storage.get(key, function (error, data) {
        if (error) {
            throw error
        }
        var value = data.setting
        doLogToConsole('info', 'readLocalUserSetting ::: key: _' + key + '_ - got value: _' + value + '_.')

        // Setting: CustomDownloadDir
        //
        if (key === 'CustomDownloadDir') {
            // not configured
            if ((value === null) || (value === undefined)) {
            // if(value === null) {
                doLogToConsole('warn', 'readLocalUserSetting ::: No user setting found for: _' + key + '_.')
                settingCustomDownloadDir = '' // default
            } else {
                doLogToConsole('info', 'readLocalUserSetting ::: Found configured _' + key + '_ with value: _' + value + '_.')

                // check if directory exists
                if (isDirectoryAvailable(value)) {
                    // check if directory exists
                    if (isDirectoryWriteable(value)) {
                        // seems like everything is ok

                        // update global var
                        settingCustomDownloadDir = value
                    } else {
                        doLogToConsole('error', 'readLocalUserSetting ::: Configured custom download dir _' + value + '_ exists BUT is not writeable. Gonna reset the user-setting.')
                        value = ''
                        settingCustomDownloadDir = value // update the global dir

                        // delete the config
                        storage.remove('CustomDownloadDir', function (error) {
                            if (error) throw error
                        })
                    }
                } else {
                    doLogToConsole('error', 'readLocalUserSetting ::: Configured custom download dir _' + value + '_ does not exists. Gonna reset the user-setting.')
                    value = ''
                    settingCustomDownloadDir = value // update the global dir

                    // delete the config
                    storage.remove('CustomDownloadDir', function (error) {
                        if (error) throw error
                    })
                }

                // Update UI select
                if (optionalUpdateSettingUI === true) {
                    $('#inputCustomTargetDir').val(value)
                }
            }
        }
        // end: CustomDownloadDir

        // Setting: AudioFormat
        //
        if (key === 'AudioFormat') {
            // not configured
            if ((value === null) || (value === undefined)) {
                doLogToConsole('warn', 'readLocalUserSetting ::: No user setting found for: _' + key + '_.')
                settingAudioFormat = 'mp3' // update global var
                writeLocalUserSetting('AudioFormat', 'mp3') // write the setting
            } else {
                doLogToConsole('info', 'readLocalUserSetting ::: Found configured _' + key + '_ with value: _' + value + '_.')
                settingAudioFormat = value // update global var

                if (optionalUpdateSettingUI === true) {
                    $('#inputGroupSelectAudio').val(value) // Update UI select
                }
            }
        }
        // end: AudioFormat

        // Setting: enableErrorReporting
        //
        if (key === 'enableErrorReporting') {
            // not configured
            if ((value === null) || (value === undefined)) {
                doLogToConsole('warn', 'readLocalUserSetting ::: No user setting found for: _' + key + '_.')
                settingEnableErrorReporting = true // default
                writeLocalUserSetting('enableErrorReporting', true) // write the setting
                // errorReporting.enableSentry()
                enableSentry()
            } else {
                doLogToConsole('info', 'readLocalUserSetting ::: Found configured _' + key + '_ with value: _' + value + '_.')
                settingEnableErrorReporting = value // update global var

                if (settingEnableErrorReporting === true) {
                    enableSentry()
                } else {
                    disableSentry()
                }

                if (optionalUpdateSettingUI === true) {
                    // Update UI select
                    if (settingEnableErrorReporting === true) {
                        $('#checkboxEnableErrorReporting').prop('checked', true)
                    } else {
                        $('#checkboxEnableErrorReporting').prop('checked', false)
                    }
                }
            }
        }
        // end: enableErrorReporting
    })
}

/**
* @name checkUrlInputField
* @summary Executed on focus - checks if the clipboard contains a valid URL - if so - its auto-pasted into the field
* @description Executed on focus - checks if the clipboard contains a valid URL - if so - its auto-pasted into the field
*/
function checkUrlInputField () {
    doLogToConsole('info', 'checkUrlInputField ::: Triggered on focus')

    // get current content of field
    var currentContentOfUrlInputField = $('#inputNewUrl').val()

    // if the field is empty - continue
    if (currentContentOfUrlInputField === '') {
        // get content of clipboard
        const { clipboard } = require('electron')
        var currentClipboardContent = clipboard.readText()
        currentClipboardContent = currentClipboardContent.trim() // remove leading and trailing blanks

        // check if it is a valid url - if so paste it
        var isUrlValid = utils.validURL(currentClipboardContent)
        if (isUrlValid) {
            $('#inputNewUrl').val(currentClipboardContent) // paste it
            $('#inputNewUrl').select() // select it entirely
            doLogToConsole('info', 'checkUrlInputField ::: Clipboard contains a valid URL (' + currentClipboardContent + '). Pasted it into the input field.')
        } else {
            doLogToConsole('info', 'checkUrlInputField ::: Clipboard contains a non valid URL (' + currentClipboardContent + ').')
        }
    }
}

/**
* @name onEnter
* @summary Executed on keypress inside url-input-field
* @description Checks if the key-press was the ENTER-key - if so simulates a press of the button ADD URL
*/
function onEnter (event) {
    var code = 0
    code = event.keyCode
    if (code === 13) {
        addURL() // simulare click on ADD URL buttom
    }
}

/**
* @name addURL
* @summary Handles the url add click of the user
* @description Handles the url add click of the user
*/
function addURL () {
    var newUrl = $('#inputNewUrl').val() // get content of input
    newUrl = newUrl.trim() // trim the url to remove blanks

    if (newUrl !== '') {
        var isUrlValid = utils.validURL(newUrl)
        if (isUrlValid) {
            doLogToConsole('info', 'addURL ::: Adding new url: _' + newUrl + '_.')
            arrayUserUrls.push(newUrl) // append to array
            toDoListUpdate() // update todo list
            logAppend('Added ' + newUrl + ' to todo list')
            $('#inputNewUrl').val('') // reset input
        } else {
            // invalid url
            doLogToConsole('error', 'addURL ::: Detected invalid url: _' + newUrl + '_.')
            showNoty('error', 'Please insert a valid url (reason: unable to dectect a valid url)')
            $('#inputNewUrl').focus() // focus to input field
            $('#inputNewUrl').select() // select it entirely
        }
    } else {
        // empty
        doLogToConsole('error', 'addURL ::: Detected empty url.')
        showNoty('error', 'Please insert a valid url (reason: was empty)')
        $('#inputNewUrl').focus() // focus to input field
    }
}

/**
* @name toDoListUpdate
* @summary Updates the todo-list after a user added an url
* @description Updates the todo-list after a user added an url
*/
function toDoListUpdate () {
    arrayUserUrls = $.unique(arrayUserUrls) // remove duplicate entries in array

    // write array content to textarea
    var textarea = document.getElementById('textareaTodoList')
    textarea.value = arrayUserUrls.join('\n')

    // if array size > 0 -> enable start button
    var arrayLength = arrayUserUrls.length
    if (arrayLength > 0) {
        uiStartButtonsEnable()
    }

    doLogToConsole('info', 'toDoListUpdate ::: Updated the todo-list')
}

/**
* @name toDoListReset
* @summary Resets the todo-list textarea
* @description Resets the todo-list textarea
*/
function toDoListReset () {
    arrayUserUrls = [] // reset the array
    arrayUrlsThrowingErrors = [] // reset the array
    document.getElementById('textareaTodoList').value = '' // reset todo-list in UI
    doLogToConsole('info', 'toDoListReset ::: Did reset the todolist-textarea')
}

/**
* @name downloadContent
* @summary Does the actual download
* @description Does the actual download
*/
function downloadContent (mode) {
    doLogToConsole('info', 'downloadContent ::: Start with mode set to: _' + mode + '_.')

    // example urls
    //
    // YOUTUBE:         http://www.youtube.com/watch?v=90AiXO1pAiA
    // VIMEO:           https://vimeo.com/315670384
    // SOUNDCLOUD:      https://soundcloud.com/jperiod/rise-up-feat-black-thought-2
    // BANDCAMP:        https://nosferal.bandcamp.com/album/nosferal-ep-mini-album

    // What is the target dir
    //
    var detectedDownloadDir = getDownloadDirectory()
    doLogToConsole('info', 'downloadContent ::: Seems like we should use the following dir: _' + detectedDownloadDir[1] + '_.')
    doLogToConsole('info', 'downloadContent ::: Got a valid download target: _' + detectedDownloadDir[0] + '_.')

    // if we got a valid download dir
    if (detectedDownloadDir[0]) {
        // Prepare UI
        uiStartButtonsDisable() // disable the start buttons
        uiOtherButtonsDisable() // disables some other buttons
        uiLoadingAnimationShow() // start download animation / spinner

        // require some stuff
        const youtubedl = require('youtube-dl')
        const { remote } = require('electron')
        const path = require('path')

        var targetPath = detectedDownloadDir[1]
        doLogToConsole('info', 'downloadContent ::: Download target is set to: _' + targetPath + '_.')

        var youtubeDlParameter = ''

        // Define the youtube-dl parameters depending on the mode (audio vs video)
        switch (mode) {
        case 'audio':
            var ffmpeg = require('ffmpeg-static-electron')
            doLogToConsole('info', 'downloadContent ::: Detected bundled ffmpeg at: _' + ffmpeg.path + '_.')
            doLogToConsole('info', 'downloadContent ::: AudioFormat is set to: _' + settingAudioFormat + '_')

            // generic parameter / flags
            youtubeDlParameter = [
                // '--verbose',
                '--format', 'bestaudio',
                // '--newline', // Output progress bar as new lines
                '--extract-audio', // Convert video files to audio-only files (requires ffmpeg or avconv and ffprobe or avprobe)
                '--audio-format', settingAudioFormat, //  Specify audio format: "best", "aac", "flac", "mp3", "m4a", "opus", "vorbis", or "wav"; "best" by default; No effect without -x
                '--audio-quality', '0', // Specify ffmpeg/avconv audio quality, insert a value between 0 (better) and 9 (worse) for VBR or a specific bitrate like 128K (default 5)
                '--ignore-errors', // Continue on download errors, for example to skip unavailable videos in a playlist
                '--output', path.join(targetPath, 'Audio', '%(artist)s-%(album)s', '%(title)s-%(id)s.%(ext)s'), // output path
                '--prefer-ffmpeg', '--ffmpeg-location', ffmpeg.path // ffmpeg location
            ]

            // prepend/add some case-specific parameter / flag
            if (settingAudioFormat === 'mp3') {
                youtubeDlParameter.unshift('--embed-thumbnail') // prepend
            }
            break

        case 'video':
            youtubeDlParameter = [
                // '--verbose',
                '--format', 'best',
                // '--newline', // Output progress bar as new lines
                '--output', path.join(targetPath, 'Video', '%(title)s-%(id)s.%(ext)s'), // output path
                '--add-metadata'
                // '--ignore-errors'
            ]
            break

        default:
            doLogToConsole('error', 'downloadContent ::: Unspecified mode. This should never happen.')
            showNoty('error', 'Unexpected download mode. Please report this issue', 0)
            return
        }

        // Check if todoArray exists otherwise abort and throw error. See: MEDIA-DUPES-J
        if (typeof arrayUserUrls === 'undefined' || !(arrayUserUrls instanceof Array)) {
            showNoty('error', 'Unexpected state of array _arrayUserUrls_ in function downloadContent(). Please report this', 0)
            return
        }

        doLogToConsole('info', 'downloadContent ::: Using youtube.dl: _' + youtubedl.getYtdlBinary() + '_.')

        arrayUrlsThrowingErrors = [] // prepare array for urls which are throwing errors

        logAppend('Set mode to: ' + mode) // Show mode in log

        // assuming we got an array with urls to process
        // for each item of the array ... try to start a download-process
        var arrayLength = arrayUserUrls.length
        for (var i = 0; i < arrayLength; i++) {
            var url = arrayUserUrls[i] // get url

            url = utils.fullyDecodeURI(url) // decode url - see #25

            doLogToConsole('info', 'downloadContent ::: Processing URL: _' + url + '_ (' + mode + ') with the following parameters: _' + youtubeDlParameter + '_.')
            logAppend('Processing: ' + url) // append url to log

            // Download
            //
            const newDownload = youtubedl.exec(url, youtubeDlParameter, {}, function (err, output) {
                if (err) {
                    // FIXME
                    // how to handle that situation
                    // seems like it happens that we got an error - but the download still worked.

                    // showNoty('error', 'Downloading <b>' + url + '</b> failed with error: ' + err, 0)
                    // showDialog('error', 'Alert', 'Download failed', 'Failed to download the url:\n' + url + '\n\nError:\n' + err)
                    doLogToConsole('error', 'downloadContent ::: Problems downloading url _' + url + ' with the following parameters: _' + youtubeDlParameter + '_.')
                    arrayUrlsThrowingErrors.push(url) // remember troublesome url
                    throw err
                }

                // check if output is defined
                // usually this isnt needed - but as we are currently not throwing the error - this additional check is needed
                if (typeof output === 'undefined') {
                    doLogToConsole('warn', 'downloadContent ::: Output is undefined .... FIXME please')
                } else {
                    // show progress
                    doLogToConsole('info', output.join('\n'))
                    logAppend(output.join('\n'))
                }

                // finish
                doLogToConsole('info', 'downloadContent ::: Finished downloading _' + url + '_.')
                logAppend('Finished downloading: ' + url)
                showNoty('success', 'Finished downloading <b>' + url + '</b>.')

                // Final notification
                if (i === arrayLength) {
                    showNotifcation('media-dupes', 'Finished downloading ' + i + ' url(s).')
                    logAppend('Finished downloading ' + i + ' url(s).')
                    toDoListReset() // empty the todo list
                    uiMakeUrgent() // mark mainWindow as urgent to inform the user about the state change
                    uiLoadingAnimationHide() // stop download animation / spinner
                    uiOtherButtonsEnable() // enable some of the buttons again
                }
            })
        }
        doLogToConsole('info', 'downloadContent ::: All download processes are now started')
    } else {
        doLogToConsole('error', 'downloadContent ::: Unable to start a download, because no useable target dir was detectable')
        showNoty('error', 'Aborted download, because no useable downloads directory was found', 0)
    }
}

/**
* @name downloadVideo
* @summary Does the actual video download
* @description Does the actual video download (without using youtube-dl.exec)
*/
function downloadVideo () {

    // http://www.youtube.com/watch?v=90AiXO1pAiA
    // https://www.youtube.com/watch?v=sJgDYdA8dio
    // https://vimeo.com/315670384
    // https://vimeo.com/274478457

    // FIXME:
    // This method now seems to work good for youtube urls 
    // BUT not for non-youtube urls

    // What is the target dir
    var detectedDownloadDir = getDownloadDirectory()
    doLogToConsole('info', 'downloadVideo ::: Seems like we should use the following dir: _' + detectedDownloadDir[1] + '_.')
    doLogToConsole('info', 'downloadVideo ::: Got a valid download target: _' + detectedDownloadDir[0] + '_.')

    // if we got a valid download dir
    if (detectedDownloadDir[0]) {
        // Prepare UI
        uiStartButtonsDisable() // disable the start buttons
        uiOtherButtonsDisable() // disables some other buttons
        uiLoadingAnimationShow() // start download animation / spinner

        // require some stuff
        const youtubedl = require('youtube-dl')
        const { remote } = require('electron')
        const path = require('path')
        const fs = require('fs')

        var targetPath = detectedDownloadDir[1]
        doLogToConsole('info', 'downloadVideo ::: Download target is set to: _' + targetPath + '_.')

        var youtubeDlParameter = ''
        youtubeDlParameter = [
            '--format', 'best',
            '--add-metadata',
            '--ignore-errors',
            '--no-mtime' // added in 0.4.0
            // '--output', path.join(targetPath, 'Video', '%(title)s-%(id)s.%(ext)s'), // output path
        ]

        // Check if todoArray exists otherwise abort and throw error. See: MEDIA-DUPES-J
        if (typeof arrayUserUrls === 'undefined' || !(arrayUserUrls instanceof Array)) {
            showNoty('error', 'Unexpected state of array _arrayUserUrls_ in function downloadVideo(). Please report this', 0)
            return
        }

        doLogToConsole('info', 'downloadVideo ::: Using youtube.dl: _' + youtubedl.getYtdlBinary() + '_.')

        // prepare array for urls which are throwing errors
        arrayUrlsThrowingErrors = []

        var finishedDownloads = 0 // to count the amount of finished downloads
        var downloadUrlTargetName = []

        // assuming we got an array with urls to process
        // for each item of the array ... try to start a download-process
        var arrayLength = arrayUserUrls.length
        logAppend('Queue contains ' + arrayLength + ' urls.')
        logAppend('Starting to download items from queue ... ')
        for (var i = 0; i < arrayLength; i++) {
            var url = arrayUserUrls[i] // get url

            // decode url - see #25
            //
            // url = decodeURI(url);
            url = utils.fullyDecodeURI(url)

            // show url
            doLogToConsole('info', 'downloadVideo ::: Processing URL: _' + url + '_.')
            logAppend('Starting to process the url: ' + url + ' ...')

            // show parameters
            doLogToConsole('info', 'downloadVideo ::: Using the following parameters: _' + youtubeDlParameter + '_.')

            const video = youtubedl(url, youtubeDlParameter)

            // Variables for progress of each download
            let size = 0
            let pos = 0
            let progress = 0

            // When the download fetches info - start writing to file
            //
            video.on('info', function (info) {
                downloadUrlTargetName[i] = path.join(targetPath, 'Video', info._filename) // define the final name & path

                size = info.size // needed to handle the progress later on('data'

                console.log('filename: ' + info._filename)
                logAppend('Filename: ' + info._filename)

                console.log('size: ' + info.size)
                logAppend('Size: ' + utils.formatBytes(info.size))

                // start the actual download & write to file
                var writeStream = fs.createWriteStream(downloadUrlTargetName[i])
                video.pipe(writeStream)
            })

            // updating progress
            //
            video.on('data', (chunk) => {
                // console.log('Getting another chunk: _' + chunk.length + '_.')
                pos += chunk.length
                if (size) {
                    progress = (pos / size * 100).toFixed(2) // calculate progress
                    console.log('Download-progress is: _' + progress + '_.')
                    logAppend('Download progress: ' + progress + '%')
                }
            })

            // If download was already completed and there is nothing more to download.
            //
            /*
            video.on('complete', function complete (info) {
                console.warn('filename: ' + info._filename + ' already downloaded.')
                logAppend('Filename: ' + info._filename + ' already downloaded.')
            })
            */

            // Download finished
            //
            video.on('end', function () {
                console.log('Finished downloading 1 url')
                logAppend('Finished downloading url')

                finishedDownloads = finishedDownloads + 1

                // if all downloads finished
                if (finishedDownloads === arrayLength) {
                    showNotifcation('media-dupes', 'Finished downloading ' + finishedDownloads + ' url(s). Queue is now empty.')
                    logAppend('Finished downloading ' + finishedDownloads + ' url(s). Queue is now empty.')
                    toDoListReset() // empty the todo list
                    uiMakeUrgent() // mark mainWindow as urgent to inform the user about the state change
                    uiLoadingAnimationHide() // stop download animation / spinner
                    uiOtherButtonsEnable() // enable some of the buttons again
                }
            })
        }
    }
}

/**
* @name showSupportedExtractors
* @summary Shows a list of all currently supported extractors of youtube-dl
* @description Shows a list of all currently supported extractors of youtube-dl
*/
function showSupportedExtractors () {
    doLogToConsole('info', 'showSupportedExtractors ::: Loading list of all supported extractors...')
    logReset() // reset the log
    uiAllElementsDisable() // disable all UI elements while function is running
    uiLoadingAnimationShow() // show loading animation

    const youtubedl = require('youtube-dl')
    youtubedl.getExtractors(true, function (err, list) {
        if (err) {
            showNoty('error', 'Unable to get youtube-dl extractor list.', 0)
            doLogToConsole('error', 'showSupportedExtractors ::: Unable to get youtube-dl extractors. Error: _' + err + '_.')
            throw err
        }

        doLogToConsole('info', 'showSupportedExtractors ::: Found ' + list.length + ' extractors')

        // show all extractors in console
        for (let i = 0; i < list.length; i++) {
            // doLogToConsole('info', 'showSupportedExtractors ::: ' + list[i])
        }

        // show all extractors in Ui log
        document.getElementById('textareaLogOutput').value = list.join('\n')

        doLogToConsole('info', 'showSupportedExtractors ::: Found ' + list.length + ' extractors') // summary in console.
        logAppend('\n\nFound ' + list.length + ' supported extractors')
        uiLoadingAnimationHide() // stop loading animation
        uiAllElementsToDefault() // set UI back to default
    })

    doLogToConsole('info', 'showSupportedExtractors ::: Finished.')
}

/**
* @name searchUpdate
* @summary Checks if there is a new release available
* @description Compares the local app version number with the tag of the latest github release. Displays a notification in the settings window if an update is available.
* @param silent - Boolean with default value. Shows a feedback in case of no available updates If 'silent' = false. Special handling for manually triggered update search
*/
function searchUpdate (silent = true) {
    uiLoadingAnimationShow()
    uiAllElementsDisable()

    var remoteAppVersionLatest = '0.0.0'
    var localAppVersion = '0.0.0'
    var versions

    // get API url
    const { urlGitHubRepoTags } = require('./js/modules/mdGithubUrls.js')

    doLogToConsole('info', 'searchUpdate ::: Start checking _' + urlGitHubRepoTags + '_ for available releases')

    var updateStatus = $.get(urlGitHubRepoTags, function (data) {
        3000 // in milliseconds

        // success
        versions = data.sort(function (v1, v2) {
            // return semver.compare(v2.name, v1.name);
        })

        // get remote version
        //
        remoteAppVersionLatest = versions[0].name
        // remoteAppVersionLatest = '66.6.6'; // overwrite variable to simulate available updates

        // get local version
        //
        localAppVersion = require('electron').remote.app.getVersion()
        // localAppVersion = '0.0.1'; //  overwrite variable to simulate

        doLogToConsole('info', 'searchUpdate ::: Local media-dupes version: ' + localAppVersion)
        doLogToConsole('info', 'searchUpdate ::: Latest media-dupes version: ' + remoteAppVersionLatest)

        // Update available
        if (localAppVersion < remoteAppVersionLatest) {
            doLogToConsole('info', 'searchUpdate ::: Found update, notify user')

            // ask user using a noty confirm dialog
            const Noty = require('noty')
            var n = new Noty(
                {
                    theme: 'bootstrap-v4',
                    layout: 'bottom',
                    type: 'info',
                    closeWith: [''], // to prevent closing the confirm-dialog by clicking something other then a confirm-dialog-button
                    text: 'A media-dupes update from <b>' + localAppVersion + '</b> to version <b>' + remoteAppVersionLatest + '</b> is available. Do you want to visit the release page?',
                    buttons: [
                        Noty.button('Yes', 'btn btn-success mediaDupes_btnDefaultWidth', function () {
                            n.close()
                            openReleasesOverview()
                        },
                        {
                            id: 'button1', 'data-status': 'ok'
                        }),

                        Noty.button('No', 'btn btn-secondary mediaDupes_btnDefaultWidth float-right', function () {
                            n.close()
                        })
                    ]
                })

            // show the noty dialog
            n.show()
        } else {
            doLogToConsole('info', 'searchUpdate ::: No newer version of media-dupes found.')

            // when executed manually via menu -> user should see result of this search
            if (silent === false) {
                showNoty('success', 'No media-dupes updates available')
            }
        }

        doLogToConsole('info', 'searchUpdate ::: Successfully checked ' + urlGitHubRepoTags + ' for available releases')
    })
        .done(function () {
        // doLogToConsole('info', 'searchUpdate ::: Successfully checked ' + urlGitHubRepoTags + ' for available releases');
        })

        .fail(function () {
            doLogToConsole('info', 'searchUpdate ::: Checking ' + urlGitHubRepoTags + ' for available releases failed.')
            showNoty('error', 'Checking <b>' + urlGitHubRepoTags + '</b> for available media-dupes releases failed. Please troubleshoot your network connection.', 0)
        })

        .always(function () {
            doLogToConsole('info', 'searchUpdate ::: Finished checking ' + urlGitHubRepoTags + ' for available releases')
            uiLoadingAnimationHide()
            uiAllElementsToDefault()
        })
}

/**
* @name openReleasesOverview
* @summary Opens the media-dupes release page
* @description Opens the url https://github.com/yafp/media-dupes/releases in the default browser. Used in searchUpdate().
*/
function openReleasesOverview () {
    const { urlGitHubReleases } = require('./js/modules/githubUrls.js')
    doLogToConsole('info', 'openReleasesOverview ::: Opening _' + urlGitHubReleases + '_ to show available releases.')
    utils.openURL(urlGitHubReleases)
}

/**
* @name openUserDownloadFolder
* @summary Triggers code in main.js to open the download folder of the user
* @description Triggers code in main.js to open the download folder of the user
*/
function openUserDownloadFolder () {
    var detectedDownloadDir = getDownloadDirectory()

    doLogToConsole('info', 'openUserDownloadFolder ::: Seems like we should use the following dir: _' + detectedDownloadDir[1] + '_.')
    doLogToConsole('info', 'openUserDownloadFolder ::: Is the reply useable: _' + detectedDownloadDir[0] + '_.')

    // if we gont a download folder which can be used
    if (detectedDownloadDir[0]) {
        const { ipcRenderer } = require('electron')
        ipcRenderer.send('openUserDownloadFolder', detectedDownloadDir[1])
    } else {
        doLogToConsole('error', 'openUserDownloadFolder ::: Unable to find a download dir.')
        showNoty('error', 'Unable to find a working download dir.', 0)
    }
}

/**
* @name startIntro
* @summary start an intro / user tutorial
* @description Starts a short intro / tutorial which explains the user-interface. Using introJs
*/
function startIntro () {
    doLogToConsole('info', 'startIntro ::: User wants to see the intro. Here you go!')
    const introJs = require('intro.js')
    introJs().start()
}

/**
* @name getDownloadDirectory
* @summary Detects what the download target dir is
* @description Validates which directory should be used as download target
* @return boolean - Do we have a useable download dir
* @return String - The detected download dir
*/
function getDownloadDirectory () {
    doLogToConsole('info', 'getDownloadDirectory ::: Gonna check for the user download directory')

    var targetPath = ''

    // Check if there is a user-configured target defined
    //
    doLogToConsole('info', 'getDownloadDirectory ::: Gonna check for user configured custom download directory now ...')
    targetPath = settingCustomDownloadDir.toString()
    if (targetPath !== '') {
        // User has configured a custom download dir
        doLogToConsole('info', 'getDownloadDirectory ::: User configured custom download directory is configured to: _' + targetPath + '_.')

        // check if that directory still exists
        if (isDirectoryAvailable(targetPath)) {
            // the custom dir exists

            // check if it is writeable
            if (isDirectoryWriteable(targetPath)) {
                doLogToConsole('info', 'getDownloadDirectory :::The custom download dir _' + targetPath + '_ is writeable. We are all good and gonna use it now')
                return [true, targetPath]
            } else {
                // folder exists but is not writeable
                doLogToConsole('error', 'getDownloadDirectory :::The custom download dir _' + targetPath + '_ exists but is not writeable. Gonna fallback to default')
                showNoty('error', 'Your configured custom download directory <b>' + targetPath + '</b> exists but is not writeable. Gonna reset the custom setting now back to default', 0)
                writeLocalUserSetting('CustomDownloadDir', '')
                settingCustomDownloadDir = ''
            }
        } else {
            // the configured dir does not exists anymore
            doLogToConsole('error', 'getDownloadDirectory :::The custom download dir _' + targetPath + '_ does not exists. Gonna fallback to default')
            showNoty('error', 'Your configured custom download directory <b>' + targetPath + '</b> does not exists anymore. Gonna reset the custom setting now back to default', 0)
            writeLocalUserSetting('CustomDownloadDir', '')
            settingCustomDownloadDir = ''
        }
    }
    // end checking custom dir

    // check the default download dir
    //
    doLogToConsole('info', 'getDownloadDirectory ::: Gonna check for user configured custom download directory now ...')
    // use the default download target
    const { remote } = require('electron')
    targetPath = remote.getGlobal('sharedObj').prop1

    // check if that directory still exists
    if (isDirectoryAvailable(targetPath)) {
        // the default download folder exists
        doLogToConsole('info', 'getDownloadDirectory ::: The default download location _' + targetPath + '_ exists')

        // check if it is writeable
        if (isDirectoryWriteable(targetPath)) {
            doLogToConsole('info', 'getDownloadDirectory ::: The default download location _' + targetPath + '_ exists and is writeable. We are all good and gonna use it now')
            return [true, targetPath]
        } else {
            // folder exists but is not writeable
            doLogToConsole('error', 'getDownloadDirectory ::: The default download location _' + targetPath + '_ exists but is not writeable. This is a major problem')
            showNoty('error', 'Your configured custom download directory <b>' + targetPath + '</b> exists but is not writeable. Gonna reset the custom setting now back to default', 0)
            return [false, '']
        }
    } else {
        // was unable to detect a download folder
        doLogToConsole('error', 'getDownloadDirectory ::: Was unable to detect an existing default download location')
        // should force the user to set a custom one
        showNoty('error', 'Unable to detect an existing default download location. Please configure a custom download directory in the application settings', 0)
        return [false, '']
    }
}

/**
* @name isDirectoryAvailable
* @summary Checks if a given directory exists
* @description Checks if a given directory exists
* @param dirPath The directory path which should be checked
* @return boolean
*/
function isDirectoryAvailable (dirPath) {
    if (dirPath !== '') {
        const fs = require('fs')
        if (fs.existsSync(dirPath)) {
            doLogToConsole('info', 'isDirectoryAvailable ::: The directory _' + dirPath + '_ exists')
            return true
        } else {
            doLogToConsole('error', 'isDirectoryAvailable ::: The directory _' + dirPath + '_ does not exist')
            return false
        }
    } else {
        doLogToConsole('error', 'isDirectoryAvailable ::: Should check if a directory exists but the supplied parameter _' + dirPath + '_ was empty')
    }
}

/**
* @name isDirectoryWriteable
* @summary Checks if a given directory is writeable
* @description Checks if a given directory is writeable
* @param dirPath The directory path which should be checked
* @return boolean
*/
function isDirectoryWriteable (dirPath) {
    if (dirPath !== '') {
        const fs = require('fs')

        // sync: check if folder is writeable
        try {
            fs.accessSync(dirPath, fs.constants.W_OK)
            doLogToConsole('info', 'isDirectoryWriteable ::: Directory _' + dirPath + '_ is writeable')
            return true
        } catch (err) {
            doLogToConsole('error', 'isDirectoryWriteable ::: Directory _' + dirPath + '_ is not writeable. Error: _' + err + '_.')
            return false
        }
    } else {
        doLogToConsole('error', 'isDirectoryWriteable ::: Should check if a directory is writeable but the supplied parameter _' + dirPath + '_ was empty.')
    }
}

/**
* @name settingsShowYoutubeDLInfo
* @summary Searches the youtube-binary and shows it in the settings dialog
* @description Searches the youtube-binary and shows it in the settings dialog
*/
function settingsShowYoutubeDLInfo () {
    const youtubedl = require('youtube-dl')

    settingsGetYoutubeDLBinaryVersion(function () {
        doLogToConsole('info', 'settingsShowYoutubeDLInfo ::: Searching youtube-dl ...')
        var youtubeDl = youtubedl.getYtdlBinary()
        if (youtubeDl === '') {
            doLogToConsole('error', 'settingsShowYoutubeDLInfo ::: Unable to find youtube-dl')
            showNoty('error', 'Unable to find dependency <b>youtube-dl</b>.', 0)
        } else {
            doLogToConsole('info', 'settingsShowYoutubeDLInfo ::: Found youtube-dl in: _' + youtubeDl + '_.')
            $('#userSettingsYouTubeDLPathInfo').val(youtubeDl) // show in UI
            $('#headerYoutubeDL').html('<i class="fab fa-youtube"></i> youtube-dl <small>Version: ' + ytdlBinaryVersion + '</small>')
        }
    })
}

/**
* @name settingsShowFfmpegInfo
* @summary Searches the ffmpeg-binary and shows it in the settings dialog
* @description Searches the ffmpeg-binary and shows it in the settings dialog
*/
function settingsShowFfmpegInfo () {
    var ffmpeg = require('ffmpeg-static-electron')
    doLogToConsole('info', 'settingsShowFfmpegInfo ::: Searching ffmpeg ...')
    if (ffmpeg === '') {
        doLogToConsole('error', 'settingsShowFfmpegInfo ::: Unable to find ffmpeg')
        showNoty('error', 'Unable to find dependency <b>ffmpeg</b>.', 0)
    } else {
        doLogToConsole('info', 'settingsShowFfmpegInfo ::: Found ffmpeg in: _' + ffmpeg.path + '_.')
        $('#userSettingsFfmpegPathInfo').val(ffmpeg.path) // show in UI
    }
}

/**
* @name settingsToggleErrorReporting
* @summary Enables or disabled the error reporting function
* @description Enables or disabled the error reporting function
*/
function settingsToggleErrorReporting () {
    if ($('#checkboxEnableErrorReporting').is(':checked')) {
        doLogToConsole('info', 'settingsToggleErrorReporting ::: Error reporting is now enabled')
        writeLocalUserSetting('enableErrorReporting', true)
        enableSentry()
        // myUndefinedFunctionFromRendererAfterEnable()
    } else {
        // ask if user really wants to disable error-reporting
        // using a confirm dialog
        const Noty = require('noty')
        var n = new Noty(
            {
                theme: 'bootstrap-v4',
                layout: 'bottom',
                type: 'info',
                closeWith: [''], // to prevent closing the confirm-dialog by clicking something other then a confirm-dialog-button
                text: '<b>Do you really want to disable error-reporting?</b><br><br>* We don\'t track users<br>* We don\'t store any IP addresses<br>* We only collect error reports<br><br>This helps us finding and fixing bugs in media-dupes',
                buttons: [
                    Noty.button('Yes', 'btn btn-success mediaDupes_btnDownloadActionWidth', function () {
                        n.close()
                        doLogToConsole('warn', 'settingsToggleErrorReporting ::: Error reporting is now disabled')
                        writeLocalUserSetting('enableErrorReporting', false)
                        disableSentry()
                        // myUndefinedFunctionFromRendererAfterDisable()
                    },
                    {
                        id: 'button1', 'data-status': 'ok'
                    }),

                    Noty.button('No', 'btn btn-secondary mediaDupes_btnDownloadActionWidth float-right', function () {
                        n.close()
                        $('#checkboxEnableErrorReporting').prop('checked', true) // revert state of checkbox
                        showNoty('success', '<b>Thanks</b> for supporting media-dupes development with your error reports.')
                        doLogToConsole('warn', 'settingsToggleErrorReporting ::: User cancelled disabling of error-reporting')
                    })
                ]
            })

        // show the noty dialog
        n.show()
    }
}

/**
* @name searchYoutubeDLUpdate
* @summary Checks if there is a new release available
* @description Compares the local app version number with the tag of the latest github release. Displays a notification in the settings window if an update is available.
* @param silent - Boolean with default value. Shows a feedback in case of no available updates If 'silent' = false. Special handling for manually triggered update search
*/
function searchYoutubeDLUpdate (silent = true) {
    var remoteAppVersionLatest = '0.0.0'
    var localAppVersion = '0.0.0'
    var versions

    // set youtube-dl API url
    const urlYTDLGitHubRepoTags = 'https://api.github.com/repos/ytdl-org/youtube-dl/tags'

    doLogToConsole('info', 'searchYoutubeDLUpdate ::: Start checking _' + urlYTDLGitHubRepoTags + '_ for available releases')

    var updateStatus = $.get(urlYTDLGitHubRepoTags, function (data) {
        3000 // in milliseconds

        // success
        versions = data.sort(function (v1, v2) {
            // return semver.compare(v2.name, v1.name);
        })

        // get remote version
        //
        remoteAppVersionLatest = versions[0].name
        // remoteAppVersionLatest = '66.6.6'; // overwrite variable to simulate available updates

        // get local version
        //
        settingsGetYoutubeDLBinaryVersion(function () {
            // used to wait for the response

            localAppVersion = ytdlBinaryVersion
            // localAppVersion = '0.0.1'; //  overwrite variable to simulate

            doLogToConsole('info', 'searchYoutubeDLUpdate ::: Local youtube-dl binary version: ' + localAppVersion)
            doLogToConsole('info', 'searchYoutubeDLUpdate ::: Latest youtube-dl binary version: ' + remoteAppVersionLatest)

            // Update available
            if (localAppVersion < remoteAppVersionLatest) {
                doLogToConsole('info', 'searchYoutubeDLUpdate ::: Found update, notify user')

                // using a confirm dialog
                const Noty = require('noty')
                var n = new Noty(
                    {
                        theme: 'bootstrap-v4',
                        layout: 'bottom',
                        type: 'info',
                        closeWith: [''], // to prevent closing the confirm-dialog by clicking something other then a confirm-dialog-button
                        text: 'An update from <b>' + localAppVersion + '</b> to version <b>' + remoteAppVersionLatest + '</b> is available. Do you want to update your youtube-dl binary?',
                        buttons: [
                            Noty.button('Yes', 'btn btn-success mediaDupes_btnDownloadActionWidth', function () {
                                n.close()
                                doUpdateYoutubeDLBinary()
                            },
                            {
                                id: 'button1', 'data-status': 'ok'
                            }),

                            Noty.button('No', 'btn btn-secondary mediaDupes_btnDownloadActionWidth float-right', function () {
                                n.close()
                            })
                        ]
                    })

                // show the noty dialog
                n.show()
            } else {
                doLogToConsole('info', 'searchYoutubeDLUpdate ::: No newer version of the youtube-dl binary found.')

                if (silent === false) {
                    showNoty('success', 'No binary updates for youtube-dl available')
                }
            }
        })

        doLogToConsole('info', 'searchYoutubeDLUpdate ::: Successfully checked ' + urlYTDLGitHubRepoTags + ' for available releases')
    })
        .done(function () {
        // doLogToConsole('info', 'searchUpdate ::: Successfully checked ' + urlGitHubRepoTags + ' for available releases');
        })

        .fail(function () {
            doLogToConsole('info', 'searchYoutubeDLUpdate ::: Checking ' + urlYTDLGitHubRepoTags + ' for available releases failed.')
            showNoty('error', 'Checking <b>' + urlYTDLGitHubRepoTags + '</b> for available releases failed. Please troubleshoot your network connection.', 0)
        })

        .always(function () {
            doLogToConsole('info', 'searchYoutubeDLUpdate ::: Finished checking ' + urlYTDLGitHubRepoTags + ' for available releases')
            uiLoadingAnimationHide()
            uiAllElementsToDefault()
        })
}

/**
* @name settingsGetYoutubeDLBinaryVersion
* @summary Gets the youtube-dl binary version and displays it in settings ui
* @description Reads the youtube-dl binary version from node_modules/youtube-dl/bin/details
* @return ytdlBinaryVersion - The youtube-dl binary version string
*/
function settingsGetYoutubeDLBinaryVersion (_callback) {
    const fs = require('fs')
    const path = require('path')

    // new
    const remote = require('electron').remote
    const app = remote.app

    var youtubeDlBinaryDetailsPath = path.join(app.getAppPath(), 'node_modules', 'youtube-dl', 'bin', 'details') // set path to youtube-dl details
    fs.readFile(youtubeDlBinaryDetailsPath, 'utf8', function (err, contents) {
        if (err) {
            doLogToConsole('error', 'settingsGetYoutubeDLBinaryVersion ::: Unable to detect youtube-dl binary version. Error: ' + err + '.')
            showNoty('error', 'Unable to detect local youtube-dl binary version number. Error: ' + err, 0) // see sentry issue: MEDIA-DUPES-5A
            throw err
        } else {
            const data = JSON.parse(contents)
            ytdlBinaryVersion = data.version // extract and store the version number
            doLogToConsole('info', 'settingsGetYoutubeDLBinaryVersion ::: youtube-dl binary is version: _' + ytdlBinaryVersion + '_.')
            _callback()
        }
    })
}

// Call from main.js ::: startSearchUpdates - verbose
//
require('electron').ipcRenderer.on('startSearchUpdatesVerbose', function () {
    searchUpdate(false) // silent = false. Forces result feedback, even if no update is available
})

// Call from main.js ::: startSearchUpdates - verbose
//
require('electron').ipcRenderer.on('startSearchUpdatesSilent', function () {
    searchUpdate(true) // silent = false. Forces result feedback, even if no update is available
})

// Call from main.js ::: openSettings
//
require('electron').ipcRenderer.on('openSettings', function () {
    settingsUiLoad()
})

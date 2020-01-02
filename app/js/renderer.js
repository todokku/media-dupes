'use strict'

// ----------------------------------------------------------------------------
// IMPORT
// ----------------------------------------------------------------------------

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

var ytdlBinaryVersion = '0.1.0'

/**
* @name initTitlebar
* @summary Init the titlebar for the frameless mainWindow
* @description Creates a custom titlebar for the mainWindow using custom-electron-titlebar (https://github.com/AlexTorresSk/custom-electron-titlebar).
*/
function initTitlebar () {
    // NOTE:
    // - 'custom-electron-titlebar' is now an archived repo
    // - switched to fork of it 'pj-custom-electron-titlebar'
    const customTitlebar = require('pj-custom-electron-titlebar')

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

    // change font size of application name in titlebar
    $('.window-title').css('font-size', '13px') // https://github.com/AlexTorresSk/custom-electron-titlebar/issues/24

    // Try to change color of menu
    //
    // works - but results in follow error:         myTitlebar.updateBackground('#ff0000');
    // followerror: titleBackground.isLigher is not a function
    // myTitlebar.updateBackground('#ff00ff');

    // Trying to update the title
    //
    // myTitlebar.updateTitle('media-dupes');

    doLogRenderer('info', 'initTitlebar ::: Initialized custom titlebar')
}

function doUpdateYoutubeDLBinary () {
    // get path of youtube-dl binary
    const youtubedl = require('youtube-dl')
    const downloader = require('youtube-dl/lib/downloader')
    const remote = require('electron').remote
    const app = remote.app
    const path = require('path')
    const userDataPath = path.join(app.getPath('userData'), 'youtube-dl')

    doLogRenderer('info', 'doUpdateYoutubeDLBinary ::: Searching youtube-dl binary')
    var youtubeDlBinaryPath = youtubedl.getYtdlBinary()
    doLogRenderer('info', 'doUpdateYoutubeDLBinary ::: Found youtube-dl binary in: _' + youtubeDlBinaryPath + '_.')

    // start downloading latest youtube-dl binary to custom path
    downloader(userDataPath, function error (err, done) {
        'use strict'
        if (err) {
            doLogRenderer('error', 'doUpdateYoutubeDLBinary ::: Error while trying to update the youtube-dl binary at: _' + userDataPath + '_. Error: ' + err)
            showNoty('error', 'Unable to update youtube-dl binary. Error: ' + err)
            throw err
        }
        doLogRenderer('info', 'doUpdateYoutubeDLBinary ::: Updated youtube-dl binary at: _' + userDataPath + '_.')

        console.log(done)
        showNoty('success', done)
    })
}

/**
* @name doLogRenderer
* @summary Writes console output for the renderer process
* @description Writes console output for the renderer process
* @param type - String which defines the log type
* @param message - String which defines the log message
*/
function doLogRenderer (type, message) {
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
        doLogRenderer('info', 'showNotification ::: Notification clicked')
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
        // doLogRenderer('info', response);
    })
}

/**
* @name loadingAnimationShow
* @summary Shows the loading animation / download spinner
* @description Shows the loading animation / download spinner
*/
function loadingAnimationShow () {
    doLogRenderer('info', 'loadingAnimationShow ::: Showing spinner')
    $('#md_spinner').attr('hidden', false)
}

/**
* @name loadingAnimationHide
* @summary Hides the loading animation / download spinner
* @description Hides the loading animation / download spinner
*/
function loadingAnimationHide () {
    doLogRenderer('info', 'loadingAnimationHide ::: Hiding spinner')
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
    doLogRenderer('info', 'logReset ::: Did reset the log-textarea')
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
        doLogRenderer('error', 'checkForDeps ::: Unable to find youtube-dl')
        showNoty('error', 'Unable to find dependency <b>youtube-dl</b>. All download function are now disabled, sorry', 0)

        // hide both buttons (video and audio)
        $('#buttonStartVideo').hide()
        $('#buttonStartAudio').hide()
    } else {
        doLogRenderer('info', 'checkForDeps ::: Found youtube-dl in: _' + youtubeDl + '_.')
    }

    // ffmpeg
    //
    var ffmpeg = require('ffmpeg-static-electron')
    if (ffmpeg === '') {
        countErrors = countErrors + 1
        doLogRenderer('error', 'checkForDeps ::: Unable to find ffmpeg')
        showNoty('error', 'Unable to find dependency <b>ffmpeg</b>. Extracting audio is now disabled, sorry', 0)

        // hide audio button
        $('#buttonStartAudio').hide()
    } else {
        doLogRenderer('info', 'checkForDeps ::: Found ffmpeg in: _' + ffmpeg.path + '_.')
    }

    doLogRenderer('info', 'checkForDeps ::: Finished checking dependencies. Found overall _' + countErrors + '_ problems.')
}

function uiResetAskUser () {
    // confirm
    const Noty = require('noty')
    var n = new Noty(
        {
            theme: 'bootstrap-v4',
            layout: 'bottom',
            type: 'info',
            text: 'Do you really want to reset the UI?',
            buttons: [
                Noty.button('Yes', 'btn btn-success', function () {
                    n.close()
                    uiReset()
                },
                {
                    id: 'button1', 'data-status': 'ok'
                }),

                Noty.button('No', 'btn btn-secondary', function () {
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
    doLogRenderer('info', 'uiReset ::: Starting to reset the UI')

    // empty input file
    $('#inputNewUrl').val('')

    // disable start button
    uiStartButtonsDisable()

    // ensure some buttons are enabled
    uiOtherButtonsEnable()

    // empty todo-list textarea
    toDoListReset()

    // empty log textarea
    logReset()

    // animation / spinner hide
    loadingAnimationHide()

    doLogRenderer('info', 'uiReset ::: Finished resetting the UI')
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

    doLogRenderer('info', 'uiAllElementsDisable ::: Disabled all UI elements of the main UI')
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

    doLogRenderer('info', 'uiAllElementsToDefault ::: Set all UI elements of the main UI back to default')
}

/**
* @name uiStartButtonsEnable
* @summary Enabled the 2 start buttons
* @description Is executed when the todo-list contains at least 1 item
*/
function uiStartButtonsEnable () {
    // enable start buttons
    $('#buttonStartVideo').prop('disabled', false)
    $('#buttonStartAudio').prop('disabled', false)

    doLogRenderer('info', 'uiStartButtonsEnable ::: Did enable both start buttons')
}

/**
* @name uiStartButtonsDisable
* @summary Disables the 2 start buttons
* @description Is executed when a download task is started by the user
*/
function uiStartButtonsDisable () {
    // disable start buttons
    $('#buttonStartVideo').prop('disabled', true)
    $('#buttonStartAudio').prop('disabled', true)

    doLogRenderer('info', 'uiStartButtonsDisable ::: Did disable both start buttons')
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
    doLogRenderer('info', 'uiOtherButtonsEnable ::: Did enable some other UI elements')
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
    doLogRenderer('info', 'uiOtherButtonsDisable ::: Did disable some other UI elements')
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
    doLogRenderer('info', 'settingsSelectCustomTargetDir ::: User wants to set a custom download directory')
    doLogRenderer('info', 'settingsSelectCustomTargetDir ::: Now opening dialog to select a new download target')

    const options = { properties: ['openDirectory'] }

    const { dialog } = require('electron').remote
    dialog.showOpenDialog(options).then(res => {
        doLogRenderer('warn', '_' + res.filePaths + '_')

        if (res.filePaths.length === 0) {
            doLogRenderer('warn', 'settingsSelectCustomTargetDir ::: User aborted selecting a custom download directory path in settings')
            showNoty('warning', 'You aborted the definition of a custom download directory')
        } else {
            var newValue = res.filePaths.toString()
            writeLocalUserSetting('CustomDownloadDir', newValue) // save the value to user-config
            $('#inputCustomTargetDir').val(newValue) // show it in the UI
            doLogRenderer('info', 'settingsSelectCustomTargetDir ::: User selected the following directory: _' + newValue + '_.')
        }
    })
}

/**
* @name settingsResetCustomTargetDir
* @summary Let the user reset the custom download target directory
* @description Is triggered via button on settings.html.
*/
function settingsResetCustomTargetDir () {
    doLogRenderer('info', 'settingsResetCustomTargetDir ::: Resetting the custom download target.')

    var newValue = ''
    writeLocalUserSetting('CustomDownloadDir', newValue) // save the value
    $('#inputCustomTargetDir').val(newValue) // show it in the UI
    settingCustomDownloadDir = newValue // update global var
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
    doLogRenderer('info', 'settingAudioFormatSave ::: User selected the audio format: _' + userSelectedAudioFormat + '_.')
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
    doLogRenderer('info', 'settingsFolderOpen ::: User wants to open its config folder.')
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
        doLogRenderer('info', 'writeLocalUserSetting ::: key: _' + key + '_ - new value: _' + value + '_')

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

    doLogRenderer('info', 'readLocalUserSetting ::: Trying to read value of key: _' + key + '_.')

    // change path for userSettings
    const userSettingsPath = path.join(app.getPath('userData'), 'UserSettings')
    storage.setDataPath(userSettingsPath)

    // read the json file
    storage.get(key, function (error, data) {
        if (error) {
            throw error
        }
        var value = data.setting
        doLogRenderer('info', 'readLocalUserSetting ::: key: _' + key + '_ - got value: _' + value + '_.')

        // Setting: CustomDownloadDir
        //
        if (key === 'CustomDownloadDir') {
            // not configured
            if ((value === null) || (value === undefined)) {
            // if(value === null) {
                doLogRenderer('warn', 'readLocalUserSetting ::: No user setting found for: _' + key + '_.')
                settingCustomDownloadDir = '' // default
            } else {
                doLogRenderer('info', 'readLocalUserSetting ::: Found configured _' + key + '_ with value: _' + value + '_.')

                // check if directory exists
                if (isDirectoryAvailable(value)) {
                    // check if directory exists
                    if (isDirectoryWriteable(value)) {
                        // seems like everything is ok

                        // update global var
                        settingCustomDownloadDir = value
                    } else {
                        doLogRenderer('error', 'readLocalUserSetting ::: Configured custom download dir _' + value + '_ exists BUT is not writeable. Gonna reset the user-setting.')
                        value = ''
                        settingCustomDownloadDir = value // update the global dir

                        // delete the config
                        storage.remove('CustomDownloadDir', function (error) {
                            if (error) throw error
                        })
                    }
                } else {
                    doLogRenderer('error', 'readLocalUserSetting ::: Configured custom download dir _' + value + '_ does not exists. Gonna reset the user-setting.')
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
                doLogRenderer('warn', 'readLocalUserSetting ::: No user setting found for: _' + key + '_.')
                settingAudioFormat = 'mp3' // update global var
                writeLocalUserSetting('AudioFormat', 'mp3') // write the setting
            } else {
                doLogRenderer('info', 'readLocalUserSetting ::: Found configured _' + key + '_ with value: _' + value + '_.')
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
                doLogRenderer('warn', 'readLocalUserSetting ::: No user setting found for: _' + key + '_.')
                settingEnableErrorReporting = true // default
                writeLocalUserSetting('enableErrorReporting', true) // write the setting
                // errorReporting.enableSentry()
                enableSentry()
            } else {
                doLogRenderer('info', 'readLocalUserSetting ::: Found configured _' + key + '_ with value: _' + value + '_.')
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
    doLogRenderer('info', 'checkUrlInputField ::: Triggered on focus')

    // get current content of field
    var currentContentOfUrlInputField = $('#inputNewUrl').val()

    // if the field is empty - continue
    if (currentContentOfUrlInputField === '') {
        // get content of clipboard
        const { clipboard } = require('electron')
        var currentClipboardContent = clipboard.readText()
        currentClipboardContent = currentClipboardContent.trim() // remove leading and trailing blanks

        // check if it is a valid url - if so paste it
        var isUrlValid = validURL(currentClipboardContent)
        if (isUrlValid) {
            $('#inputNewUrl').val(currentClipboardContent) // paste it
            $('#inputNewUrl').select() // select it entirely
            doLogRenderer('info', 'checkUrlInputField ::: Clipboard contains a valid URL (' + currentClipboardContent + '). Pasted it into the input field.')
        } else {
            doLogRenderer('info', 'checkUrlInputField ::: Clipboard contains a non valid URL (' + currentClipboardContent + ').')
        }
    }
}

/**
* @name validURL
* @summary checks if a given string is a valid url
* @description checks if a given string is a valid url
* @param str - Given url
* @return boolean
*/
function validURL (str) {
    var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
    '(\\#[-a-z\\d_]*)?$', 'i') // fragment locator
    return !!pattern.test(str)
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
        var isUrlValid = validURL(newUrl)
        if (isUrlValid) {
            doLogRenderer('info', 'addURL ::: Adding new url: _' + newUrl + '_.')
            arrayUserUrls.push(newUrl) // append to array
            toDoListUpdate() // update todo list
            logAppend('Added ' + newUrl + ' to todo list')
            $('#inputNewUrl').val('') // reset input
        } else {
            // invalid url
            doLogRenderer('error', 'addURL ::: Detected invalid url: _' + newUrl + '_.')
            showNoty('error', 'Please insert a valid url (reason: was invalid)')
            $('#inputNewUrl').focus() // focus to input field
            $('#inputNewUrl').select() // select it entirely
        }
    } else {
        // empty
        doLogRenderer('error', 'addURL ::: Detected empty url.')
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

    doLogRenderer('info', 'toDoListUpdate ::: Updated the todo-list')
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
    doLogRenderer('info', 'toDoListReset ::: Did reset the todolist-textarea')
}

/**
* @name isEncoded
* @summary Helper method for fullyDecodeURI
* @description Helper method for fullyDecodeURI
* @param uri
* @return uri
*/
function isEncoded (uri) {
    uri = uri || ''
    return uri !== decodeURIComponent(uri)
}

/**
* @name fullyDecodeURI
* @summary Used to decode URLs
* @description
* param uri - The incoming uri
* @return uri - a decoded url
*/
function fullyDecodeURI (uri) {
    while (isEncoded(uri)) {
        uri = decodeURIComponent(uri)
        doLogRenderer('info', 'fullyDecodeURI ::: URL: _' + uri + '_ is now fully decoded.')
    }
    return uri
}

/**
* @name downloadContent
* @summary Does the actual download
* @description Does the actual download
*/
function downloadContent (mode) {
    doLogRenderer('info', 'downloadContent ::: Start with mode set to: _' + mode + '_.')

    // example urls
    //
    // YOUTUBE:         http://www.youtube.com/watch?v=90AiXO1pAiA
    // VIMEO:           https://vimeo.com/315670384
    // SOUNDCLOUD:      https://soundcloud.com/jperiod/rise-up-feat-black-thought-2
    // BANDCAMP:        https://nosferal.bandcamp.com/album/nosferal-ep-mini-album

    // What is the target dir
    //
    var detectedDownloadDir = getDownloadDirectory()
    doLogRenderer('info', 'downloadContent ::: Seems like we should use the following dir: _' + detectedDownloadDir[1] + '_.')
    doLogRenderer('info', 'downloadContent ::: Got a valid download target: _' + detectedDownloadDir[0] + '_.')

    // if we got a valid download dir
    if (detectedDownloadDir[0]) {
        // Prepare UI
        uiStartButtonsDisable() // disable the start buttons
        uiOtherButtonsDisable() // disables some other buttons
        loadingAnimationShow() // start download animation / spinner

        // require some stuff
        const youtubedl = require('youtube-dl')
        const { remote } = require('electron')
        const path = require('path')

        var targetPath = detectedDownloadDir[1]
        doLogRenderer('info', 'downloadContent ::: Download target is set to: _' + targetPath + '_.')

        var youtubeDlParameter = ''

        // Define the youtube-dl parameters depending on the mode (audio vs video)
        switch (mode) {
        case 'audio':
            var ffmpeg = require('ffmpeg-static-electron')
            doLogRenderer('info', 'downloadContent ::: Detected bundled ffmpeg at: _' + ffmpeg.path + '_.')
            doLogRenderer('info', 'downloadContent ::: AudioFormat is set to: _' + settingAudioFormat + '_')

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
                '--add-metadata',
                '--ignore-errors'
            ]
            break

        default:
            doLogRenderer('error', 'downloadContent ::: Unspecified mode. This should never happen.')
            showNoty('error', 'Unexpected download mode. Please report this issue')
            return
        }

        // Check if todoArray exists otherwise abort and throw error. See: MEDIA-DUPES-J
        if (typeof arrayUserUrls === 'undefined' || !(arrayUserUrls instanceof Array)) {
            showNoty('error', 'Unexpected state of array _arrayUserUrls_ in function downloadContent(). Please report this')
            return
        }

        doLogRenderer('info', 'downloadContent ::: Using youtube.dl: _' + youtubedl.getYtdlBinary() + '_.')

        // prepare array for urls which are throwing errors
        arrayUrlsThrowingErrors = []

        // assuming we got an array with urls to process
        // for each item of the array ... try to start a download-process
        var arrayLength = arrayUserUrls.length
        for (var i = 0; i < arrayLength; i++) {
            var url = arrayUserUrls[i] // get url

            // decode url - see #25
            //
            // url = decodeURI(url);
            url = fullyDecodeURI(url)

            doLogRenderer('info', 'downloadContent ::: Processing URL: _' + url + '_.')
            doLogRenderer('info', 'downloadContent ::: Using the following parameters: _' + youtubeDlParameter + '_.')

            logAppend('Processing: ' + url) // append url to log

            // Download
            //
            const video = youtubedl.exec(url, youtubeDlParameter, {}, function (err, output) {
                if (err) {
                    // showNoty('error', 'Downloading <b>' + url + '</b> failed with error: ' + err, 0)
                    showDialog('error', 'Alert', 'Download failed', 'Failed to download the url:\n' + url + '\n\nError:\n' + err)
                    doLogRenderer('error', 'downloadContent ::: Problems downloading url _' + url + ' with the following parameters: _' + youtubeDlParameter + '_.')
                    arrayUrlsThrowingErrors.push(url) // remember troublesome url
                    throw err
                }

                // show progress
                doLogRenderer('info', output.join('\n'))
                logAppend(output.join('\n'))

                // finish
                doLogRenderer('info', 'downloadContent ::: Finished downloading _' + url + '_.')
                logAppend('Finished downloading: ' + url)
                showNoty('success', 'Finished downloading <b>' + url + '</b>.')

                // Final notification
                if (i === arrayLength) {
                    showNotifcation('media-dupes', 'Finished downloading ' + i + ' url(s).')
                    logAppend('Finished downloading ' + i + ' url(s).')
                    toDoListReset() // empty the todo list
                    uiMakeUrgent() // mark mainWindow as urgent to inform the user about the state change
                    loadingAnimationHide() // stop download animation / spinner
                    uiOtherButtonsEnable() // enable some of the buttons again
                }
            })
        }
        doLogRenderer('info', 'downloadContent ::: All download processes are now started')
    } else {
        doLogRenderer('error', 'downloadContent ::: Unable to start a download, because no useable target dir was detectable')
        showNoty('error', 'Aborted download, because no useable downloads directory was found', 0)
    }
}

/**
* @name downloadVideo
* @summary Does the actual video download
* @description Does the actual video download
*/
function downloadVideo () {
    // IMPORTANT / FIXME / TODO
    // - this function is not yet in use - its the playground right now to test if download video without using .exec makes more sense for this project
    // - not really able to handle multiple files / urls properly at the moment

    // http://www.youtube.com/watch?v=90AiXO1pAiA
    // https://www.youtube.com/watch?v=sJgDYdA8dio
    // https://vimeo.com/315670384

    // What is the target dir
    var detectedDownloadDir = getDownloadDirectory()
    doLogRenderer('info', 'downloadVideo ::: Seems like we should use the following dir: _' + detectedDownloadDir[1] + '_.')
    doLogRenderer('info', 'downloadVideo ::: Got a valid download target: _' + detectedDownloadDir[0] + '_.')

    // if we got a valid download dir
    if (detectedDownloadDir[0]) {
        // Prepare UI
        uiStartButtonsDisable() // disable the start buttons
        uiOtherButtonsDisable() // disables some other buttons
        loadingAnimationShow() // start download animation / spinner

        // require some stuff
        const youtubedl = require('youtube-dl')
        const { remote } = require('electron')
        const path = require('path')
        const fs = require('fs')

        var targetPath = detectedDownloadDir[1]
        doLogRenderer('info', 'downloadVideo ::: Download target is set to: _' + targetPath + '_.')

        var youtubeDlParameter = ''
        youtubeDlParameter = [
            '--format', 'best',
            '--add-metadata',
            '--ignore-errors'
            // '--output', path.join(targetPath, 'Video', '%(title)s-%(id)s.%(ext)s'), // output path
        ]

        // Check if todoArray exists otherwise abort and throw error. See: MEDIA-DUPES-J
        if (typeof arrayUserUrls === 'undefined' || !(arrayUserUrls instanceof Array)) {
            showNoty('error', 'Unexpected state of array _arrayUserUrls_ in function downloadVideo(). Please report this')
            return
        }

        doLogRenderer('info', 'downloadVideo ::: Using youtube.dl: _' + youtubedl.getYtdlBinary() + '_.')

        // prepare array for urls which are throwing errors
        arrayUrlsThrowingErrors = []

        // assuming we got an array with urls to process
        // for each item of the array ... try to start a download-process
        var arrayLength = arrayUserUrls.length
        for (var i = 0; i < arrayLength; i++) {
            var url = arrayUserUrls[i] // get url

            // decode url - see #25
            //
            // url = decodeURI(url);
            url = fullyDecodeURI(url)

            doLogRenderer('info', 'downloadVideo ::: Processing URL: _' + url + '_.')
            doLogRenderer('info', 'downloadVideo ::: Using the following parameters: _' + youtubeDlParameter + '_.')

            const video = youtubedl(url, youtubeDlParameter)

            // generate a temporary filename
            var timestamp = String(Number(new Date()))
            var curTempVideoTargetPath = path.join(targetPath, 'Video', timestamp)

            var finalVideoTargetPath

            let size = 0
            let pos = 0
            let progress = 0

            // Will be called when the download starts.
            video.on('info', function (info) {
                finalVideoTargetPath = path.join(targetPath, 'Video', info._filename)
                size = info.size
                console.log(finalVideoTargetPath)

                console.log('filename: ' + info._filename)
                logAppend('Filename: ' + info._filename)

                console.log('size: ' + info.size)
                // logAppend('Size: ' + info.size)
                logAppend('Size: ' + formatBytes(info.size))
                // http://www.youtube.com/watch?v=90AiXO1pAiA

                console.log('Download started')
                logAppend('Starting download ...')
            })

            // updating
            video.on('data', (chunk) => {
                // console.log('Getting another chunk: _' + chunk.length + '_.')
                pos += chunk.length
                if (size) {
                    progress = (pos / size * 100).toFixed(2)
                    console.log('Download-progress is: _' + progress + '_.')
                    logAppend('Download progress: ' + progress + '%')
                }
            })

            // Will be called if download was already completed and there is nothing more to download.
            video.on('complete', function complete (info) {
                'use strict'
                console.warn('filename: ' + info._filename + ' already downloaded.')
            })

            video.on('end', function () {
                console.log('finished downloading!')
                logAppend('Finished downloading: ' + url)

                // renaming?
                fs.rename(curTempVideoTargetPath, finalVideoTargetPath, function (err) {
                    if (err) {
                        throw err
                    }

                    fs.stat(finalVideoTargetPath, function (err, stats) {
                        if (err) {
                            throw err
                        }
                        console.log('stats: ' + JSON.stringify(stats))
                    })
                })

                loadingAnimationHide()
            })

            // start the download
            video.pipe(fs.createWriteStream(curTempVideoTargetPath))
        }
    }
}

/**
* @name formatBytes
* @summary Calculate bytes to...
* @description Calculate bytes to...
* @param bytes - Incoming bytes value
* @param decimals (optimal, defaults to 2)
* @return Human readable value
*/
function formatBytes (bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

/**
* @name showSupportedExtractors
* @summary Shows a list of all currently supported extractors of youtube-dl
* @description Shows a list of all currently supported extractors of youtube-dl
*/
function showSupportedExtractors () {
    doLogRenderer('info', 'showSupportedExtractors ::: Loading list of all supported extractors...')
    logReset() // reset the log
    uiAllElementsDisable() // disable all UI elements while function is running
    loadingAnimationShow() // show loading animation

    const youtubedl = require('youtube-dl')
    youtubedl.getExtractors(true, function (err, list) {
        if (err) {
            showNoty('error', 'Unable to get youtube-dl extractor list.', 0)
            doLogRenderer('error', 'showSupportedExtractors ::: Unable to get youtube-dl extractors. Error: _' + err + '_.')
            throw err
        }

        doLogRenderer('info', 'showSupportedExtractors ::: Found ' + list.length + ' extractors')

        // show all extractors in console
        for (let i = 0; i < list.length; i++) {
            // doLogRenderer('info', 'showSupportedExtractors ::: ' + list[i])
        }

        // show all extractors in Ui log
        document.getElementById('textareaLogOutput').value = list.join('\n')

        doLogRenderer('info', 'showSupportedExtractors ::: Found ' + list.length + ' extractors') // summary in console.
        logAppend('\n\nFound ' + list.length + ' supported extractors')
        loadingAnimationHide() // stop loading animation
        uiAllElementsToDefault() // set UI back to default
    })

    doLogRenderer('info', 'showSupportedExtractors ::: Finished.')
}

/**
* @name searchUpdate
* @summary Checks if there is a new release available
* @description Compares the local app version number with the tag of the latest github release. Displays a notification in the settings window if an update is available.
* @param silent - Boolean with default value. Shows a feedback in case of no available updates If 'silent' = false. Special handling for manually triggered update search
*/
function searchUpdate (silent = true) {
    loadingAnimationShow()
    uiAllElementsDisable()

    // when executed manually via menu -> user should see that update-check is running
    if (silent === false) {
        showNoty('info', 'Searching for updates')
    }

    var remoteAppVersionLatest = '0.0.0'
    var localAppVersion = '0.0.0'
    var versions

    // get API url
    const { urlGitHubRepoTags } = require('./js/modules/githubUrls.js')

    doLogRenderer('info', 'searchUpdate ::: Start checking _' + urlGitHubRepoTags + '_ for available releases')

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

        doLogRenderer('info', 'searchUpdate ::: Local version: ' + localAppVersion)
        doLogRenderer('info', 'searchUpdate ::: Latest public version: ' + remoteAppVersionLatest)

        // Update available
        if (localAppVersion < remoteAppVersionLatest) {
            doLogRenderer('info', 'searchUpdate ::: Found update, notify user')

            // using a confirm dialog
            const Noty = require('noty')
            var n = new Noty(
                {
                    theme: 'bootstrap-v4',
                    layout: 'bottom',
                    type: 'info',
                    text: 'An update from <b>' + localAppVersion + '</b> to version <b>' + remoteAppVersionLatest + '</b> is available. Do you want to visit the release page?',
                    buttons: [
                        Noty.button('Yes', 'btn btn-success', function () {
                            n.close()
                            openReleasesOverview()
                        },
                        {
                            id: 'button1', 'data-status': 'ok'
                        }),

                        Noty.button('No', 'btn btn-secondary', function () {
                            n.close()
                        })
                    ]
                })

            // show the noty dialog
            n.show()
        } else {
            doLogRenderer('info', 'searchUpdate ::: No newer version found.')

            // when executed manually via menu -> user should see result of this search
            if (silent === false) {
                showNoty('success', 'No updates available')
            }
        }

        doLogRenderer('info', 'searchUpdate ::: Successfully checked ' + urlGitHubRepoTags + ' for available releases')
    })
        .done(function () {
        // doLogRenderer('info', 'searchUpdate ::: Successfully checked ' + urlGitHubRepoTags + ' for available releases');
        })

        .fail(function () {
            doLogRenderer('info', 'searchUpdate ::: Checking ' + urlGitHubRepoTags + ' for available releases failed.')
            showNoty('error', 'Checking <b>' + urlGitHubRepoTags + '</b> for available releases failed. Please troubleshoot your network connection.')
        })

        .always(function () {
            doLogRenderer('info', 'searchUpdate ::: Finished checking ' + urlGitHubRepoTags + ' for available releases')
            loadingAnimationHide()
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
    doLogRenderer('info', 'openReleasesOverview ::: Opening _' + urlGitHubReleases + '_ to show available releases.')
    openURL(urlGitHubReleases)
}

/**
* @name openURL
* @summary Opens an url in browser
* @description Opens a given url in default browser. This is pretty slow, but got no better solution so far.
* @param url - URL string which contains the target url
*/
function openURL (url) {
    const { shell } = require('electron')
    doLogRenderer('info', 'openURL ::: Trying to open the url: _' + url + '_.')
    shell.openExternal(url)
}

/**
* @name openUserDownloadFolder
* @summary Triggers code in main.js to open the download folder of the user
* @description Triggers code in main.js to open the download folder of the user
*/
function openUserDownloadFolder () {
    var detectedDownloadDir = getDownloadDirectory()

    doLogRenderer('info', 'openUserDownloadFolder ::: Seems like we should use the following dir: _' + detectedDownloadDir[1] + '_.')
    doLogRenderer('info', 'openUserDownloadFolder ::: Is the reply useable: _' + detectedDownloadDir[0] + '_.')

    // if we gont a download folder which can be used
    if (detectedDownloadDir[0]) {
        const { ipcRenderer } = require('electron')
        ipcRenderer.send('openUserDownloadFolder', detectedDownloadDir[1])
    } else {
        doLogRenderer('error', 'openUserDownloadFolder ::: Unable to find a download dir.')
        showNoty('error', 'Unable to find a working download dir.', 0)
    }
}

/**
* @name startIntro
* @summary start an intro / user tutorial
* @description Starts a short intro / tutorial which explains the user-interface. Using introJs
*/
function startIntro () {
    doLogRenderer('info', 'startIntro ::: User wants to see the intro. Here you go!')
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
    doLogRenderer('info', 'getDownloadDirectory ::: Gonna check for the user download directory')

    var targetPath = ''

    // Check if there is a user-configured target defined
    //
    doLogRenderer('info', 'getDownloadDirectory ::: Gonna check for user configured custom download directory now ...')
    targetPath = settingCustomDownloadDir.toString()
    if (targetPath !== '') {
        // User has configured a custom download dir
        doLogRenderer('info', 'getDownloadDirectory ::: User configured custom download directory is configured to: _' + targetPath + '_.')

        // check if that directory still exists
        if (isDirectoryAvailable(targetPath)) {
            // the custom dir exists

            // check if it is writeable
            if (isDirectoryWriteable(targetPath)) {
                doLogRenderer('info', 'getDownloadDirectory :::The custom download dir _' + targetPath + '_ is writeable. We are all good and gonna use it now')
                return [true, targetPath]
            } else {
                // folder exists but is not writeable
                doLogRenderer('error', 'getDownloadDirectory :::The custom download dir _' + targetPath + '_ exists but is not writeable. Gonna fallback to default')
                showNoty('error', 'Your configured custom download directory <b>' + targetPath + '</b> exists but is not writeable. Gonna reset the custom setting now back to default')
                writeLocalUserSetting('CustomDownloadDir', '')
                settingCustomDownloadDir = ''
            }
        } else {
            // the configured dir does not exists anymore
            doLogRenderer('error', 'getDownloadDirectory :::The custom download dir _' + targetPath + '_ does not exists. Gonna fallback to default')
            showNoty('error', 'Your configured custom download directory <b>' + targetPath + '</b> does not exists anymore. Gonna reset the custom setting now back to default')
            writeLocalUserSetting('CustomDownloadDir', '')
            settingCustomDownloadDir = ''
        }
    }
    // end checking custom dir

    // check the default download dir
    //
    doLogRenderer('info', 'getDownloadDirectory ::: Gonna check for user configured custom download directory now ...')
    // use the default download target
    const { remote } = require('electron')
    targetPath = remote.getGlobal('sharedObj').prop1

    // check if that directory still exists
    if (isDirectoryAvailable(targetPath)) {
        // the default download folder exists
        doLogRenderer('info', 'getDownloadDirectory ::: The default download location _' + targetPath + '_ exists')

        // check if it is writeable
        if (isDirectoryWriteable(targetPath)) {
            doLogRenderer('info', 'getDownloadDirectory ::: The default download location _' + targetPath + '_ exists and is writeable. We are all good and gonna use it now')
            return [true, targetPath]
        } else {
            // folder exists but is not writeable
            doLogRenderer('error', 'getDownloadDirectory ::: The default download location _' + targetPath + '_ exists but is not writeable. This is a major problem')
            showNoty('error', 'Your configured custom download directory <b>' + targetPath + '</b> exists but is not writeable. Gonna reset the custom setting now back to default', 0)
            return [false, '']
        }
    } else {
        // was unable to detect a download folder
        doLogRenderer('error', 'getDownloadDirectory ::: Was unable to detect an existing default download location')
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
            doLogRenderer('info', 'isDirectoryAvailable ::: The directory _' + dirPath + '_ exists')
            return true
        } else {
            doLogRenderer('error', 'isDirectoryAvailable ::: The directory _' + dirPath + '_ does not exist')
            return false
        }
    } else {
        doLogRenderer('error', 'isDirectoryAvailable ::: Should check if a directory exists but the supplied parameter _' + dirPath + '_ was empty')
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
            doLogRenderer('info', 'isDirectoryWriteable ::: Directory _' + dirPath + '_ is writeable')
            return true
        } catch (err) {
            doLogRenderer('error', 'isDirectoryWriteable ::: Directory _' + dirPath + '_ is not writeable. Error: _' + err + '_.')
            return false
        }
    } else {
        doLogRenderer('error', 'isDirectoryWriteable ::: Should check if a directory is writeable but the supplied parameter _' + dirPath + '_ was empty.')
    }
}

/**
* @name settingsShowYoutubeDLInfo
* @summary Searches the youtube-binary and shows it in the settings dialog
* @description Searches the youtube-binary and shows it in the settings dialog
*/
function settingsShowYoutubeDLInfo () {
    const youtubedl = require('youtube-dl')
    doLogRenderer('info', 'settingsShowYoutubeDLInfo ::: Searching youtube-dl ...')
    var youtubeDl = youtubedl.getYtdlBinary()
    if (youtubeDl === '') {
        doLogRenderer('error', 'settingsShowYoutubeDLInfo ::: Unable to find youtube-dl')
        showNoty('error', 'Unable to find dependency <b>youtube-dl</b>.', 0)
    } else {
        doLogRenderer('info', 'settingsShowYoutubeDLInfo ::: Found youtube-dl in: _' + youtubeDl + '_.')
        $('#userSettingsYouTubeDLPathInfo').val(youtubeDl) // show in UI
        //$('#headerYoutubeDL').html('youtube-dl <small>Version: ' + ytdlBinaryVersion + '</small>')
    }
}

/**
* @name settingsShowFfmpegInfo
* @summary Searches the ffmpeg-binary and shows it in the settings dialog
* @description Searches the ffmpeg-binary and shows it in the settings dialog
*/
function settingsShowFfmpegInfo () {
    var ffmpeg = require('ffmpeg-static-electron')
    doLogRenderer('info', 'settingsShowFfmpegInfo ::: Searching ffmpeg ...')
    if (ffmpeg === '') {
        doLogRenderer('error', 'settingsShowFfmpegInfo ::: Unable to find ffmpeg')
        showNoty('error', 'Unable to find dependency <b>ffmpeg</b>.', 0)
    } else {
        doLogRenderer('info', 'settingsShowFfmpegInfo ::: Found ffmpeg in: _' + ffmpeg.path + '_.')
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
        doLogRenderer('info', 'settingsToggleErrorReporting ::: Error reporting is now enabled')
        writeLocalUserSetting('enableErrorReporting', true)
        enableSentry()
        // myUndefinedFunctionFromRendererAfterEnable()
    } else {
        doLogRenderer('warn', 'settingsToggleErrorReporting ::: Error reporting is now disabled')
        writeLocalUserSetting('enableErrorReporting', false)
        disableSentry()
        // myUndefinedFunctionFromRendererAfterDisable()
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

    // set API url
    const urlYTDLGitHubRepoTags = 'https://api.github.com/repos/ytdl-org/youtube-dl/tags'

    doLogRenderer('info', 'searchUpdate ::: Start checking _' + urlYTDLGitHubRepoTags + '_ for available releases')

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

            doLogRenderer('info', 'searchYoutubeDLUpdate ::: Local version: ' + localAppVersion)
            doLogRenderer('info', 'searchYoutubeDLUpdate ::: Latest public version: ' + remoteAppVersionLatest)

            // Update available
            if (localAppVersion < remoteAppVersionLatest) {
                doLogRenderer('info', 'searchYoutubeDLUpdate ::: Found update, notify user')

                // using a confirm dialog
                const Noty = require('noty')
                var n = new Noty(
                    {
                        theme: 'bootstrap-v4',
                        layout: 'bottom',
                        type: 'info',
                        text: 'An update from <b>' + localAppVersion + '</b> to version <b>' + remoteAppVersionLatest + '</b> is available. Do you want to update your youtube-dl binary?',
                        buttons: [
                            Noty.button('Yes', 'btn btn-success', function () {
                                n.close()
                                doUpdateYoutubeDLBinary()
                            },
                            {
                                id: 'button1', 'data-status': 'ok'
                            }),

                            Noty.button('No', 'btn btn-secondary', function () {
                                n.close()
                            })
                        ]
                    })

                // show the noty dialog
                n.show()
            } else {
                doLogRenderer('info', 'searchYoutubeDLUpdate ::: No newer version found.')

                if (silent === false) {
                    showNoty('success', 'No binary updates for youtube-dl available')
                }
            }
        })

        doLogRenderer('info', 'searchYoutubeDLUpdate ::: Successfully checked ' + urlYTDLGitHubRepoTags + ' for available releases')
    })
        .done(function () {
        // doLogRenderer('info', 'searchUpdate ::: Successfully checked ' + urlGitHubRepoTags + ' for available releases');
        })

        .fail(function () {
            doLogRenderer('info', 'searchYoutubeDLUpdate ::: Checking ' + urlYTDLGitHubRepoTags + ' for available releases failed.')
            showNoty('error', 'Checking <b>' + urlYTDLGitHubRepoTags + '</b> for available releases failed. Please troubleshoot your network connection.')
        })

        .always(function () {
            doLogRenderer('info', 'searchYoutubeDLUpdate ::: Finished checking ' + urlYTDLGitHubRepoTags + ' for available releases')
            loadingAnimationHide()
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

    fs.readFile('./node_modules/youtube-dl/bin/details', 'utf8', function (err, contents) {
        if (err) {
            doLogRenderer('error', 'settingsGetYoutubeDLBinaryVersion ::: Unable to detect youtube-dl binary version. Error: ' + err + '.')
            throw err
        } else {
            const data = JSON.parse(contents)
            ytdlBinaryVersion = data.version
            doLogRenderer('info', 'settingsGetYoutubeDLBinaryVersion ::: youtube-dl binary is version: _' + ytdlBinaryVersion + '_.')
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

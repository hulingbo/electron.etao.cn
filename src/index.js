import {app, BrowserWindow, ipcMain} from 'electron';
import request from 'request'
import installExtension, {VUEJS_DEVTOOLS} from 'electron-devtools-installer';
import {enableLiveReload} from 'electron-compile';
import {ipaddress, scan, batchprint} from './printer'
ipcMain.on('edupdatemealorder', async (event, args) => {
    console.log(args);
    request({ //1.请求需要打印的数据
        url: args.config.url,
        method: 'POST',
        headers: args.config.headers,
        json: args.data
    }, function(error, response, body) {
        if (body.data.printdata.length <= 0) {
            return false
        }
        batchprint(body.data.printdata, function(data) {
            request({
                url: args.config.url,
                method: 'POST',
                headers: args.config.headers,
                json: Object.assign(args.cbdata, {
                    variables: {
                        p: {
                            id: data.id,
                            printedtimes: data.printedtimes * 1 + 1
                        }
                    }
                })
            }, function(error1, response1, body1) {
                console.log(body1);
            })
        })
    })
})
ipcMain.on('printer.init', (event, args) => {
    scan(function(result) {
        mainWindow.webContents.send('printer.init', result)
    })
})
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
const isDevMode = process.execPath.match(/[\\/]electron/);
if (isDevMode)
    enableLiveReload();
const createWindow = async () => {
    // Create the browser window.
    var windowOptions = {
        width: 1366,
        minWidth: 1024,
        height: 768,
        title: app.getName()
    }
    mainWindow = new BrowserWindow(windowOptions);
    // and load the index.html of the app.
    mainWindow.loadURL(`http://nbw.b.etao.cn`);
    // Open the DevTools.
    if (isDevMode) {
        await installExtension(VUEJS_DEVTOOLS);
        mainWindow.webContents.openDevTools();
    }
    // Emitted when the window is closed.
    mainWindow.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });
};
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);
// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

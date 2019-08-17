const electron = require('electron');
const url = require('url');
const path = require('path');

const {app, BrowserWindow, Menu, ipcMain} = electron;

let mainWindow;
let addWindow;




//Listen for app to be ready
app.on('ready', function(){
    //Create new window
    mainWindow = new BrowserWindow(
        {
            webPreferences: {
                nodeIntegration: true
            }
        }
    );
    //Load html into window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file:',
        slashes: true
    }));  

    //Quit all windows when app is closed
    mainWindow.on('closed', function(){
        app.quit();
    })
    
    //Build Menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    //Insert Menu
    Menu.setApplicationMenu(mainMenu);
});

//Create new internal window
function createAddWindow(){
     //Create new window
     addWindow = new BrowserWindow({ 
         width: 400, 
         height: 200,
         title: 'Add Shopping List Item',
         webPreferences: {
             nodeIntegration: true
         } 
     });
     //Load html into window
     addWindow.loadURL(url.format({
         pathname: path.join(__dirname, 'addWindow.html'),
         protocol: 'file:',
         slashes: true
     }));  
     //Garbage collection handle
     addWindow.on('closed', function(){
         addWindow = null;
     })
}

//Catch item:add
ipcMain.on('item:add',function(_e, item){
    mainWindow.webContents.send('item:add', item);
    addWindow.close();
})

const mainMenuTemplate = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Add Item',
                accelerator: process.platform == 'darwin' ? 'Command + F' : 'Ctrl + F',
                click(){
                    createAddWindow();
                }
                    
                
            },
            {
                label: 'Clear Items',
                click(){
                    mainWindow.webContents.send('item:clear');
                }
            },
            {
                label: 'Quit',
                accelerator: process.platform == 'darwin' ? 'Command + Q' : 'Ctrl + Q',
                click(){
                    app.quit();
                }
            }
        ]
    }
];

//Shift file from menu bar if on MacOS
if(process.platform == 'darwin'){
    mainMenuTemplate.unshift({});
}

//Add Developer tools if not in production mode
if(process.env.NODE_ENV !== 'production'){
    mainMenuTemplate.push({
        label: 'Developer Tools',
        submenu: [
            {
                label: 'Toggle Dev Tools',
                accelerator: process.platform == 'darwin' ? 'Command + I' : 'Ctrl + I',
                click(_item, focusedWindow){
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: 'reload'
            }
        ]
    })
}


        
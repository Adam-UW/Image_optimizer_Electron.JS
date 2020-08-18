const {app, BrowserWindow, Menu, globalShortcut } = require('electron')
// Set env
process.env.NODE_ENV = 'development'
//*{To check if the app is on Dev or on Production} 
const isDev = process.env.NODE_ENV !== 'production' ? true : false
// console.log(process.platform)
const isMac= process.platform === 'darwin' ? true : false
const isWin= process.platform === 'win32' ? true : false

let mainWindow
let aboutWindow

function createMainWindow(){
     mainWindow = new BrowserWindow({
        title: 'ImageShrink',
        width: 500,
        height: 600,
        icon: `${__dirname}/assets/icons/Icon_256x256.png`,
        resizable: isDev,
        backgroundColor: 'white'
    })

    // mainWindow.loadURL(`file://${__dirname}/app/index.html`)
    mainWindow.loadFile('./app/index.html')
}

//About 
function createAboutWindow(){
    aboutWindow = new BrowserWindow({
       title: 'About ImageShrink',
       width: 300,
       height: 300,
       icon: `${__dirname}/assets/icons/Icon_256x256.png`,
       resizable: false,
       backgroundColor: 'white'
   })

   // mainWindow.loadURL(`file://${__dirname}/app/index.html`)
   aboutWindow.loadFile('./app/about.html')
}



app.on('ready', ()=>{
    createMainWindow()

    const mainMenu = Menu.buildFromTemplate(menu)
    Menu.setApplicationMenu(mainMenu)

    // globalShortcut.register('CmdOrCtrl+R', ()=> mainWindow.reload())
    // globalShortcut.register( isMac ? 'CmdOrCtrl+Alt+I' : 'Ctrl+Shift+I', ()=> mainWindow.toggleDevTools())

    mainWindow.on('closed', ()=> mainWindow = null) // For garbage collection
})

const menu = [
    ...(isMac ? [{
        label : app.name,
        submenu: [
            {
                label: 'About',
                click: createAboutWindow
            }
        ]
    }] : []), // For mac to show the File on top
    {
        // label: 'File',
        // submenu:[
        //     {
        //         label: 'Quit',
        //         accelerator: isMac ? 'Commmand+W' : 'Ctrl+W',
        //         // accelerator: 'CmdOrCtrl+W', {OPTIONAL, Cross platform}
        //         click: () => app.quit()
        //     }
        // ]
        role: 'fileMenu', // @NOTE this replaces the code above!! how cool is that
    },
    ...(! isMac ? [ // Order is messed up So far
        {
            label: 'Help',
            submenu:  [
                {
                    label: 'About',
                    click: createAboutWindow

                }
            ]
        }
    ] : []),
    ...(isDev ? [
        {
            label: 'Developer',
            submenu:[
                {role: 'reload'},
                {role: 'forcereload'},
                {type: 'separator'},
                {role: 'toggledevtools'},
            ]
        }
    ] : [])
]

// For mac user to show the file jMenu
if(isMac){
    menu.unshift({ role: 'appMenu'})
}

app.on('window-all-closed', ()=>{
    if(!isMac){
        app.quit()
    }
})

app.on('activate', ()=>{
    if(BrowserWindow.getAllWindows().length === 0){
        createMainWindow()
    }
})

app.allowRendererProcessReuse = true
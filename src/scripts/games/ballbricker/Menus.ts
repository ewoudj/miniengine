import { Engine } from '../../Engine'
import { IMenuItem, Menu } from '../../Menu'
import { Logic } from './Logic'

export const mainMenu: IMenuItem[] = [{
    text: ''
},{
    text: ''
},{
    text: ''
},{
    text: 'START GAME',
    onClick: (engine: Engine):void => {
        const l = engine.logic as Logic;
        l.startGame();
    }
}, {
    text: 'LEVEL EDITOR',
    onClick: (engine: Engine):void => {
        const l = engine.logic as Logic;
        l.startEditor();
    }
}, {
    text: 'SETTINGS',
    onClick: (engine: Engine) => {
        (engine.logic as Logic).menu.setItems(settingsMenu);
    }
}];

const settingsMenu: IMenuItem[] = [{
    text: 'AUDIO',
    onClick: (engine: Engine) => {
        // if(engine.getItem("effectsVolume",'0') === '0'){
        // 	engine.effectsVolume = 10;
        // }
        // else{
        // 	engine.effectsVolume = 0;
        // }
        // // Persist the setting
        // engine.setItem('effectsVolume', engine.effectsVolume);
        // window.audio.setVolume(engine.effectsVolume);
        // // Update the menu (so it now correctly says 2d/3d)
        // engine.rules.menu.setItems(settingsMenu);
    },
    getText: () => {
        let result;
        // if(engine.getItem("effectsVolume",'0') === '0'){
        // 	result = '      AUDIO: OFF';
        // }
        // else{
        result = '      AUDIO:  ON';
        // }
        return result; 
    }
}, {
    text: 'VIDEO',
    onClick: (engine: Engine) => {
        // if(engine.getItem("renderer",'classic') === 'classic'){
        //     var webglAvailable = false;
        //     var iOS = /(iPad|iPhone|iPod)/g.test( navigator.userAgent );
        //     if(!iOS){
        //         webglAvailable = ( function () {
        //             try {
        //                 return (!! window.WebGLRenderingContext && !! document.createElement( 'canvas' ).getContext( 'experimental-webgl' ));
        //             } catch( e ) {
        //                 return false;
        //             }
        //         } )();
        //         if(webglAvailable){
        //             engine.renderer = 'webgl';
        //         }
        //         else{
        //             engine.renderer = 'classic';
        //         }
        //     }
        // }
        // else{
        // 	engine.renderer = 'classic';
        // }
        // // Persist the setting
        // engine.setItem('renderer', engine.renderer);
        // // Update the menu (so it now correctly says 2d/3d)
        // entity.engine.rules.menu.setItems(settingsMenu);
    },
    getText: () => {
        let result;
        // if(engine.getItem("renderer",'classic') === 'classic'){
        result = '      VIDEO:  2D';
        // }
        // else{
        // 	result = '      VIDEO:  3D';
        // }
        return result; 
    }
},{
    text: ''
}, {
    text: '      MAIN MENU',
    onClick: (engine: Engine) => {
        (engine.logic as Logic).menu.setItems(mainMenu);
    }
}];

export const gameOverMenu: IMenuItem[] = [{
    text: '      GAME OVER'
}, {
    text: ''
}, {
    text: '      PLAY AGAIN',
    onClick: (engine: Engine) => {
        // (engine.logic as Logic).startSinglePlayerGame();
    }
}, {
    text: '      MAIN MENU',
    onClick: (engine: Engine) => {
        (engine.logic as Logic).menu.setItems(mainMenu);
    }
}];
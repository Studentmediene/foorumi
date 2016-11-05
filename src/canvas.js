import React, { Component } from 'react';
import ReactDom from 'react-dom';

import './canvas.css'
import Player from './Player'
import playerImage from './it-man-sprite.png'
import './canvas.css'
import lvl1 from './level1'

class Canvas extends Component {
  constructor(props) {
    super(props);
    this._startGame = this._startGame.bind(this);
    this._animate = this._animate.bind(this);
  }

  fps = 50;
  fpsInterval = 1000/this.fps;
  startTime = undefined;
  then = undefined;
  elapsed = undefined;


  TILES_IN_VIEW_X = 16;
  _keystate = {};
  _canvas = undefined;
  _context = undefined;
  _loop: null;
  _ballRadius = 10;
  _x = this.props.width/2;
  _y = this.props.height-30;
  _dx = 8;
  _dy = -40;
  tileSize = 40;
  _windowOffsetX = 0;
  _windowOffsetY = 0;
  _player: null;
  _playerWidth = 40;
  _playerHeight = -80;
  _playerX = this.props.width/2 - this._playerWidth/2;
  _playerY = this.props.height - this.tileSize;

  //MOVE TO PLAYER.js LATER
  isJumping = false;

  _maxWindowOffsetX = - lvl1[0].length * this.tileSize + this.TILES_IN_VIEW_X * this.tileSize


  componentDidMount() {
    this._setupCanvas();
    this._context.font = '30px Arial';
    this._context.fillText('Foorumi',
      this.props.width/2,
      this.props.height/2 );
    setTimeout(this._startGame, 500);
  }



  _setupCanvas() {
    this._canvas = ReactDom.findDOMNode(this);
    this._context = this._canvas.getContext('2d');
  }

  _startGame() {

    // If the game loop is already started, do nothing.
    if(this._loop){
      return;
    }

    document.addEventListener('keydown', (evt) => {
      this._keystate[evt.keyCode] = true;
      //console.log('Key pressed')
    });
    document.addEventListener('keyup', (evt) => {
      // Do not delete, setting to undefined is faster.
      this._keystate[evt.keyCode] = undefined;
      //console.log('key up')
    });

    const image = new Image();
    image.src = playerImage;
    this._player = new Player(this._context, 1048, 80, image);




    this.fpsInterval = 1000/this.fps;
    this.then = Date.now();
    this.startTime = this.then;
    this._animate()

  }

  _animate() {

    // calc elapsed time since last loop

    const now = Date.now();
    const elapsed = now - this.then;

    if (elapsed > this.fpsInterval) {

        // Get ready for next frame by setting then=now, but also adjust for your
        // specified fpsInterval not being a multiple of RAF's interval (16.7ms)
        this.then = now - (elapsed % this.fpsInterval);

        // Put your drawing code here
        this._update();
        this._draw();

    }
      // request another frame
      requestAnimationFrame(this._animate);
  }

  _update() {
    this._player.updateRun();

    // Put all computations of the new state here
    this._updateWindowOffset();
    this._updatePlayerPosition()
    //this._updateBall();
  }

  _updateWindowOffset() {
    //console.log(this._windowOffsetX)
    //console.log(lvl1[0].length * this.tileSize)
    if (this._keystate[39]){ // Right pressed
      // If the player is moving on the left side, do nothing
      if(this._playerX < this.props.width/2 - this._playerWidth/2){
        return;
      }
      this._windowOffsetX -= this._dx
    } else if (this._keystate[37]) { // Left pressed
      if(this._playerX > this.props.width/2 - this._playerWidth/2){
        return
      }
      this._windowOffsetX += this._dx
    }
    if (this._windowOffsetX > 0) {
      this._windowOffsetX = 0;
    } else if (this._windowOffsetX < this._maxWindowOffsetX){
      this._windowOffsetX = this._maxWindowOffsetX
    }
  }

  _updatePlayerPosition() {
    /**
     * Must be run after this._updateWindowOffset();
    */
    if(this._keystate[37]){ // Pressing left
      if (this._windowOffsetX === 0) {
        // We are at the left edge
        //console.log('We are moving left, and are at the left edge')
        this._playerX -= this._dx
      } else if (this._windowOffsetX === this._maxWindowOffsetX) {
        // We are at the right edge
        //console.log('We are moving left and are at the right edge')
        this._playerX -= this._dx
      }
    } else if(this._keystate[39]){ // Pressing right
      if (this._windowOffsetX === 0) {
        // We are at the left edge
        //console.log('We are moving right, and are at the left edge')
        this._playerX += this._dx
      }
      else if (this._windowOffsetX === this._maxWindowOffsetX) { // Right pressed
          // We are at the right edge
          //console.log('We are moving right and are at the right edge')
          this._playerX += this._dx
      }
    }

    // Handle jumping
    // If the player is not already jumping, and "up" is pressed...
    if(!this.isJumping && this._keystate[38]) {
      this.isJumping = true;
    }
    if(this.isJumping) {
      this._playerY += this._dy;
      this._dy += 4;
      if(this._playerY > this.props.height - this.tileSize){
        this.isJumping = false;
        this._playerY = this.props.height - this.tileSize;
        this._dy = -40;
      }
    }

    // Handle cases where the player is about to leave the stage
    if(this._playerX < 0){
      console.log('Player hit left wall!')
      this._playerX = 0;
    } else if (this._playerX > this.props.width - this._playerWidth) {
      console.log('Player hit right wall!')
      this._playerX = this.props.width - this._playerWidth;
    }

    // Handle cases where the player runs past the middle of the screen
    if(this._windowOffsetX === 0 && this._playerX > this.props.width/2 - this._playerWidth/2){
      // We are at the left edge
      console.log('Player ran right across the middle!')
      this._playerX = this.props.width/2 - this._playerWidth/2
    } else if (this._windowOffsetX === this._maxWindowOffsetX && this._playerX < this.props.width/2 - this._playerWidth/2) {
      // We are at the right edge
      console.log('Player ran left across the middle!')
      this._playerX = this.props.width/2 - this._playerWidth/2
    }
  }

  _draw() {

    //this._player.updateRun();

    // Only put drawing on the canvas element here.
    this._context.clearRect(0, 0, this.props.width, this.props.height);
    this.drawTiles();
    this._drawPlayer();
        this._player.render();
    //this._drawBall();
  }

  _drawBall() {
    this._context.beginPath();
    this._context.arc(this._x, this._y, this._ballRadius, 0, Math.PI*2);
    this._context.fillStyle = "#0095DD";
    this._context.fill();
    this._context.closePath();
  }

  _drawPlayer() {
    this.drawTile(this._playerX,
      this._playerY,
      this._playerHeight,
      this._playerWidth,
      0,
      0);

      this._context.lineWidth = 1;
      this._context.strokeStyle = "black";
      this._context.beginPath();
      this._context.arc(this._playerX + this._playerWidth/2, this._playerY - 60, this._ballRadius, 0, Math.PI);
      this._context.stroke()
      this._context.closePath();

      this._context.beginPath();
      this._context.arc(this._playerX + this._playerWidth/2 - 5, this._playerY - 65, 2, 0, Math.PI*2);
      this._context.stroke()
      this._context.closePath();

      this._context.beginPath();
      this._context.arc(this._playerX + this._playerWidth/2 + 5, this._playerY - 65, 2, 0, Math.PI*2);
      this._context.stroke();
      this._context.closePath();
  }

  drawTiles() {
    this._context.lineWidth = 1;
    this._context.fillStyle = "rgba(255,0,0,0.6)";
    this._context.strokeStyle = "black";
    lvl1.forEach((row,i) => {
      row.forEach((tile,j) => {
        if(tile !== 'o'){ //if tile is not walkable
          this.drawTile(j * this.tileSize,
                        i * this.tileSize,
                        this.tileSize,
                        this.tileSize,
                        this._windowOffsetX,
                        this._windowOffsetY); //draw a rectangle at j,i
        }
      });
    });
  }

  drawTile(x,y, length, height, offsetX, offsetY){
    this._context.fillRect(
      x + offsetX, y + offsetY,
      height, length
    );
    this._context.strokeRect(
      x + offsetX, y + offsetY,
      height, length
    );
  }

  _updateBall() {
    if(this._x + this._dx > this.props.width - this._ballRadius || this._x + this._dx < this._ballRadius) {
      this._dx = -this._dx;
    }

    if(this._y + this._dy > this.props.height - this._ballRadius || this._y + this._dy < this._ballRadius) {
      this._dy = -this._dy;
    }
    this._x += this._dx;
    this._y += this._dy;
  }

  render() {
    return (
      <canvas id="myCanvas" className={'canvas'} width={this.props.width} height={this.props.height}></canvas>
    );
  }
}

Canvas.propTypes = {
  height: React.PropTypes.number.isRequired,
  width: React.PropTypes.number.isRequired,
}

export default Canvas;

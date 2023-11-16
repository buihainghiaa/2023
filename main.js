let canvas = document.querySelector('canvas');
let c = canvas.getContext('2d');
let imageList = [
  'a1.jpg',
  'a2.jpg',
  'a3.jpg',
  'a5.jpg',
  'a6.jpg',
  'a4.jpg',
  // Thêm các URL hình ảnh khác ở đây
];
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let mouse = {
  x: window.innerWidth / 2,
  y: window.innerHeight / 2
};

let isMouseDown = false;

window.addEventListener("mousemove", function (event) {
  mouse.x = event.clientX;
  mouse.y = event.clientY;
});

window.addEventListener("resize", function () {
  canvas.height = window.innerHeight;
  canvas.width = window.innerWidth;

  initializeletiables();
});


window.addEventListener("mousedown", function () {
  isMouseDown = true;
});

window.addEventListener("mouseup", function () {
  isMouseDown = false;
});

canvas.addEventListener("touchstart", function () {
  isMouseDown = true;
});

canvas.addEventListener("touchmove", function (event) {
  event.preventDefault();
  mouse.x = event.touches[ 0 ].pageX;
  mouse.y = event.touches[ 0 ].pageY;
});

canvas.addEventListener("touchend", function () {
  isMouseDown = false;
});




let canvasElem = document.querySelector("canvas");
let coordinatesX;
let coordinatesY;

canvasElem.addEventListener("mousedown", function (e) {
  coordinatesX = e.x;
  coordinatesY = e.y;
});



function Cannon(x, y, width, height, color) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.angle = 0;
  this.color = color;

  this.update = function () {
    desiredAngle = Math.atan2(mouse.y - this.y, mouse.x - this.x);
    this.angle = desiredAngle;
    this.draw();
  };

  this.draw = function () {
    c.save();
    c.translate(this.x, this.y);
    c.rotate(this.angle);
    c.beginPath();
    c.fillStyle = this.color;
    c.shadowColor = this.color;
    c.shadowBlur = 3;
    c.shadowOffsetX = 0;
    c.shadowOffsetY = 0;
    c.fillRect(0, -this.height / 2, this.width, height);
    c.closePath();
    c.restore();
  };
}

function Cannonball(x, y, dx, dy, radius, color, cannon, particleColors) {
  this.x = x;
  this.y = y;
  this.dx = dx;
  this.dy = -dy;
  this.radius = radius;
  this.color = color;
  this.particleColors = particleColors;
  this.source = cannon;
  this.timeToLive = canvas.height / (canvas.height + 800);


  this.init = function () {
    // Initialize the cannonballs start coordinates (from muzzle of cannon)
    this.x = Math.cos(this.source.angle) * this.source.width;
    this.y = Math.sin(this.source.angle) * this.source.width;

    // Translate relative to canvas positioning
    this.x = this.x + (canvas.width / 2);
    this.y = this.y + (canvas.height);

    // Determine whether the cannonball should be 
    // fired to the left or right of the cannon
    if (mouse.x - canvas.width / 2 < 0) {
      this.dx = -this.dx;
    }

    console.log(mouse.x, mouse.y)
    let cooX = window.innerWidth / 2;
    let cooY = window.innerHeight;
    console.log(cooX, cooY)
    let kc = Math.sqrt((mouse.x - cooX) * (mouse.x - cooX) + (mouse.y - cooY) * (mouse.y - cooY)) / 50;

    console.log(kc)

    this.dy = Math.sin(this.source.angle) * kc;
    this.dx = Math.cos(this.source.angle) * kc;
  };

  this.update = function () {
    if (this.y + this.radius + this.dy > canvas.height) {
      this.dy = -this.dy;
    } else {
      this.dy += gravity;
    }

    this.x += this.dx;
    this.y += this.dy;
    this.draw();

    this.timeToLive -= 0.01;
  };

  this.draw = function () {
    c.save();
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.shadowColor = this.color;
    c.shadowBlur = 5;
    c.shadowOffsetX = 0;
    c.shadowOffsetY = 0;
    c.fillStyle = this.color;
    c.fill();
    c.closePath();
    c.restore();
  };

  this.init();
}

function Particle(x, y, dx, dy, radius, particleImage) {
  this.x = x;
  this.y = y;
  this.dx = dx;
  this.dy = -dy;
  this.radius = radius;
  this.particleImage = particleImage;
  this.timeToLive = 3;
  this.scale = 1;

  this.update = function () {
    if (this.y + this.radius + this.dy > canvas.height) {
      this.dy = -this.dy;
    }

    if (this.x + this.radius + this.dx > canvas.width || this.x - this.radius + this.dx < 0) {
      this.dx = -this.dx;
    }

    this.x += this.dx;
    this.y += this.dy;

    const scalingTime = 1000; // 60 FPS * 8 giây
    if (this.scale < 3) {
      this.scale += 8 / scalingTime;
    }

    this.timeToLive -= 0.01;
  };

  this.draw = function () {
    c.save();
    c.translate(this.x, this.y);
    c.scale(this.scale, this.scale);
    c.drawImage(this.particleImage, -this.radius, -this.radius, this.radius * 2, this.radius * 2);
    c.restore();
  };
}

function Explosion(cannonball) {
  this.particles = [];
  this.source = cannonball;

  this.init = function () {
    let dx = (Math.random() * 6) - 3;
    let dy = (Math.random() * 6) - 3;

    this.particles.push(new Particle(this.source.x, this.source.y, dx, dy, 10, roseImage));
  };

  this.init();

  this.update = function () {
    for (let i = 0; i < this.particles.length; i++) {
      this.particles[ i ].update();

      if (this.particles[ i ].timeToLive <= 0) {
        this.particles.splice(i, 1);
      }
    }
  };

  this.draw = function () {
    for (let i = 0; i < this.particles.length; i++) {
      this.particles[ i ].draw();
    }
  };

  this.drawRose = function () {
    for (let i = 0; i < this.particles.length; i++) {
      c.save();
      c.translate(this.particles[ i ].x, this.particles[ i ].y);
      c.scale(this.particles[ i ].scale, this.particles[ i ].scale);
      c.drawImage(roseImage, -20, -20, 40, 40);
      c.restore();
    }
  };
}


function Explosion(cannonball) {
  let roseImage = new Image();
  let randomRoseIndex = Math.floor(Math.random() * imageList.length);
  roseImage.src = imageList[ randomRoseIndex ];
  this.particles = [];
  this.source = cannonball;

  this.init = function () {
    for (let i = 0; i < 2; i++) {
      let dx = (Math.random() * 6) - 3;
      let dy = (Math.random() * 6) - 3;

      let randomImageIndex = Math.floor(Math.random() * imageList.length);
      let randomImage = new Image();
      randomImage.src = imageList[ randomImageIndex ];

      this.particles.push(new Particle(this.source.x, this.source.y, dx, dy, 10, randomImage));
    }
  };
  this.init();

  this.update = function () {
    for (let i = 0; i < this.particles.length; i++) {
      this.particles[ i ].update();

      if (this.particles[ i ].timeToLive <= 0) {
        this.particles.splice(i, 1);
      }
    }
  };

  this.draw = function () {
    for (let i = 0; i < this.particles.length; i++) {
      this.particles[ i ].draw();
    }
  };

  // Thêm logic để vẽ hình ảnh bông hoa hồng
  this.drawRose = function () {
    for (let i = 0; i < this.particles.length; i++) {
      c.save();
      c.translate(this.particles[ i ].x, this.particles[ i ].y);
      c.scale(this.particles[ i ].scale, this.particles[ i ].scale);
      c.drawImage(roseImage, -20, -20, 40, 40); // Điều chỉnh kích thước và vị trí nếu cần
      c.restore();
    }
  };
}

let gravity = 0.08;
let desiredAngle = 0;
let cannon, cannonballs, explosions, colors;

function initializeletiables() {
  cannon = new Cannon(canvas.width / 2, canvas.height - canvas.height / 70, 40, 10, "pink");
  cannonballs = [];
  explosions = [];
  colors = [
    // Red / Orange
    {
      cannonballColor: "pink",
      particleImage: new Image(),
    },
  ];
  colors[ 0 ].particleImage.src = 'cherry-blossom.svg';

}

initializeletiables();

let timer = 0;
let isIntroComplete = false;
let introTimer = 0;
let timeSinceLastShot = 0;
function animate() {
  window.requestAnimationFrame(animate);

  // Sử dụng CSS để đặt hình nền cho canvas
  canvas.style.backgroundImage = "url('bgr.png')"; // Thay 'new_bg.jpg' bằng đường dẫn đến tệp hình ảnh mới

  c.clearRect(0, 0, canvas.width, canvas.height);
  cannon.update();


  if (isIntroComplete === false) {
    introTimer += 1;

    if (introTimer % 3 === 0) {
      let randomColor = Math.floor(Math.random() * colors.length);
      let color = colors[ randomColor ];

      cannonballs.push(new Cannonball(canvas.width / 2, canvas.height / 2, 2, 2, 4, color.cannonballColor, cannon, color.particleColors));
    }

    if (introTimer > 30) {
      isIntroComplete = true;
    }
  }

  // Vẽ cannonballs
  for (let i = 0; i < cannonballs.length; i++) {
    cannonballs[ i ].update();

    if (cannonballs[ i ].timeToLive <= 0) {

      // Tạo hiệu ứng nổ sau khi thời gian sống của cannonball kết thúc
      explosions.push(new Explosion(cannonballs[ i ]));

      cannonballs.splice(i, 1);
    }
  }

  // Vẽ hiệu ứng nổ
  for (let j = 0; j < explosions.length; j++) {
    explosions[ j ].update();
    explosions[ j ].draw(); // Vẽ các particles
    explosions[ j ].drawRose(); // Vẽ hình ảnh bông hoa hồng
    // Xóa hiệu ứng nổ khỏi màn hình khi tất cả các hạt đều đã biến mất
    if (explosions[ j ].particles.length <= 0) {
      explosions.splice(j, 1);
    }
  }

  if (isMouseDown === true) {
    timeSinceLastShot += 1;
    if (timeSinceLastShot >= 6) { // 10 giây, với 60 FPS (600 frames)
      let randomParticleColorIndex = Math.floor(Math.random() * colors.length);
      let randomColors = colors[ randomParticleColorIndex ];

      cannonballs.push(new Cannonball(mouse.x, mouse.y, 2, 2, 4, randomColors.cannonballColor, cannon, randomColors.particleColors));
      timeSinceLastShot = 0; // Đặt lại thời gian
    }
  }
}




const heart = document.querySelector('.heart');
const circle = document.querySelector('.circle');
const container = document.querySelector('.container');
const save = document.querySelector('.save');

function toggleHeart() {
  heart.classList.toggle("heart-filled");
  circle.classList.toggle("circle-show");
  container.classList.toggle("container-shadow");
  document.body.classList.toggle("background-heart");
  heart.style.animationPlayState = "running";
  showSaved();
}







animate();
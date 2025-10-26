$(function () {
    $('.image-editor').cropit({
        exportZoom: 1,
        maxZoom: 3,
        imageBackground: false,
        imageBackgroundBorderWidth: 50,
        type: 'image/jpeg', quality: 1,

    });
    $('.rotate-cw-btn').click(function () {
        $('.image-editor').cropit('rotateCW');
    });
    $('.rotate-ccw-btn').click(function () {
        $('.image-editor').cropit('rotateCCW');
    });
    $('.export').click(function () {

        var imageData = $('.image-editor').cropit('export');
        var NAME = document.getElementById("firstname").value;
        var NATION = document.getElementById("nation").value;
        var NATION2 = "./images/" + NATION + ".png";
        var POTEN = document.getElementById("poten").value;
        var FILTER = document.getElementById("imgf").value;
        var FONTFILTER = document.getElementById("fontf").value;
        var FONTWIDTH = document.getElementById("fontw").value;
        var SIGN = document.getElementById("madeby").value;
        var canvas = document.getElementById("canvas");
        var can = document.querySelector('canvas');

        if (canvas.getContext) {
            var ctx = canvas.getContext('2d');
            var img = new Image();
            img.src = imageData;

            img.onload = function () {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                roundedImage(1.6, 1.6, 346.5, 346.5, 60);
                ctx.clip();
                ctx.scale(1, 1);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                ctx.restore();
                var filter = new Image();
                filter.src = 'filter/og4.png';
                filter.onload = function () {
                    ctx.drawImage(filter, 0, 0, canvas.width, canvas.height);
                    var imgft = document.createElement("img");
                    imgft.src = FILTER;

                    imgft.onload = function () {
                        ctx.drawImage(imgft, 0, 0, canvas.width, canvas.height);
                        ctx.textAlign = "center";
                        var ft = document.createElement("img");
                        ft.src = 'filter/fontfilter2.png';
                        ft.onload = function () {



                            var img2 = new Image();
                            if (NATION == "")
                                img2.src = 'images/None.png';
                            else
                                img2.src = NATION2;
                            img2.onload = function () {
                                ctx.drawImage(img2, 0, 0, canvas.width, canvas.height);
                                var img3 = new Image();
                                img3.src = POTEN;
                                img3.onload = function () {
                                    ctx.drawImage(img3, 0, 0, canvas.width, canvas.height);
                                    var img4 = new Image();
                                    img4.src = 'filter/filter1.png';
                                    img4.onload = function () {
                                        drawText();
                                    }

                                }
                            }
                        }




                        function drawText() {
                            if (FONTWIDTH == 'base') {
                                can.style.letterSpacing = 2.1 + 'px';
                                if (NAME >= 'a' && NAME <= 'z') {
                                    ctx.font = "36px 'Bebas Neue'";
                                }
                                else if (NAME >= 'A' && NAME <= 'Z') {
                                    ctx.font = "36px 'Bebas Neue'";
                                }
                                else if (NAME >= '가' && NAME <= '힣') {
                                    ctx.font = "italic 40px 'koverwatch'";
                                }
                                else {
                                    ctx.font = "36px 'Bebas Neue'";
                                }
                                ctx.save()
                                ctx.scale(0.83, 0.95);
                            }
                            else if (FONTWIDTH == 'long') {
                                can.style.letterSpacing = 1.05 + 'px';
                                if (NAME >= 'a' && NAME <= 'z') {
                                    ctx.font = "30px 'Bebas Neue'";
                                }
                                else if (NAME >= 'A' && NAME <= 'Z') {
                                    ctx.font = "30px 'Bebas Neue'";
                                }
                                else if (NAME >= '가' && NAME <= '힣') {
                                    ctx.font = "italic 40px 'koverwatch'";
                                }
                                else {
                                    ctx.font = "30px 'Bebas Neue'";
                                }
                                ctx.save()
                                ctx.scale(0.83, 0.95);
                            }
                            if (FONTWIDTH == 'strap') {
                                can.style.letterSpacing = 1.05 + 'px';
                                if (NAME >= 'a' && NAME <= 'z') {
                                    ctx.font = "italic 30px 'Bebas Neue'";
                                }
                                else if (NAME >= 'A' && NAME <= 'Z') {
                                    ctx.font = "italic 30px 'Bebas Neue'";
                                }
                                else if (NAME >= '가' && NAME <= '힣') {
                                    ctx.font = "italic 30px 'koverwatch'";
                                }
                                else {
                                    ctx.font = "30px 'Bebas Neue'";
                                }
                                ctx.save()
                                ctx.scale(0.83, 0.93);
                            }


                            if (FONTWIDTH == 'strap') {
                                ctx.shadowColor = "rgba(11,1,2,0.5)";
                                ctx.shadowOffsetX = -1.5;
                                ctx.shadowOffsetY = 1.5;
                                ctx.shadowBlur = 0.1;
                            }
                            else {
                                ctx.shadowColor = "rgba(11,1,2,0.5)";
                                ctx.shadowOffsetX = -1.5;
                                ctx.shadowOffsetY = 1.5;
                                ctx.shadowBlur = 0.5;
                            }
                            ctx.textAlign = "center";
                            if (FONTWIDTH == 'strap') {
                                ctx.textAlign = "left";

                                ctx.translate(0, 0);
                                ctx.rotate(-85 * Math.PI / 180);
                                ctx.textAlign = 'right';



                                ctx.fillText(NAME, -73, 57);
                            }
                            else {
                                ctx.fillText(NAME, canvas.width * 1.21 / 2, (95 * canvas.height / 100) * 1.047);
                            }
                            // Create gradient
                            var gradient = ctx.createLinearGradient((canvas.width * 1.21 / 2) - (ctx.measureText(NAME).width / 2), 0, (canvas.width * 1.21 / 2) + (ctx.measureText(NAME).width / 2), 0);
                            if (FONTFILTER == '#ffd700') {
                                gradient.addColorStop("0", "rgba(223,204,162,1)");
                                gradient.addColorStop("0.01", "rgba(223,204,162,1)");
                                gradient.addColorStop("0.12", "rgba(213,192,145,1)");
                                gradient.addColorStop("0.22", "rgba(228,210,171,1)");
                                gradient.addColorStop("0.34", "rgba(223,204,162,1)");
                                gradient.addColorStop("0.44", "rgba(228,210,171,1)");
                                gradient.addColorStop("0.54", "rgba(213,192,145,1)");
                                gradient.addColorStop("0.65", "rgba(228,210,171,1)");
                                gradient.addColorStop("0.77", "rgba(223,204,162,1)");
                                gradient.addColorStop("0.90", "rgba(228,210,171,1)");
                                gradient.addColorStop("1", "rgba(196,168,117,1)");
                                ctx.fillStyle = gradient;
                            }
                            else if (FONTFILTER == '#c0c0c0') {
                                gradient.addColorStop("0", "rgba(179,171,171,1)");
                                gradient.addColorStop("0.01", "rgba(179,171,171,1)");
                                gradient.addColorStop("0.12", "rgba(210,202,202,1)");
                                gradient.addColorStop("0.22", "rgba(203,197,197,1)");
                                gradient.addColorStop("0.34", "rgba(179,171,171,1)");
                                gradient.addColorStop("0.44", "rgba(235,225,225,1)");
                                gradient.addColorStop("0.54", "rgba(210,202,202,1)");
                                gradient.addColorStop("0.65", "rgba(235,225,225,1)");
                                gradient.addColorStop("0.77", "rgba(179,171,171,1)");
                                gradient.addColorStop("0.90", "rgba(235,225,225,1)");
                                gradient.addColorStop("1", "rgba(190,186,186,1)");
                                ctx.fillStyle = gradient;
                            }
                            else if (FONTFILTER == '#7b68ee') {
                                gradient.addColorStop("0", "rgba(67,198,172,1)");
                                gradient.addColorStop("1", "rgba(25,22,84,1)");
                                ctx.fillStyle = gradient;
                            }
                            else if (FONTFILTER == '#b0e0e6') {
                                gradient.addColorStop("0", "rgba(76, 161, 175,1)");
                                gradient.addColorStop("1", "rgba(196, 224, 229,1)");
                                ctx.fillStyle = gradient;
                            }
                            else if (FONTFILTER == '#f0c27b') {
                                gradient.addColorStop("0", "rgba(240, 194, 123,1)");
                                gradient.addColorStop("1", "rgba(75, 18, 72,1)");
                                ctx.fillStyle = gradient;
                            }
                            else if (FONTFILTER == '#abbaab') {
                                gradient.addColorStop("0", "rgba(171, 186, 171,1)");
                                gradient.addColorStop("1", "rgba(255, 255, 255,1)");
                                ctx.fillStyle = gradient;

                            }

                            else {
                                ctx.fillStyle = FONTFILTER;
                            }





                            // Fill with gradient
                            ctx.shadowColor = "black";
                            if (FONTWIDTH == 'strap') {
                                ctx.shadowOffsetX = 0;
                                ctx.shadowOffsetY = 0;
                                ctx.shadowBlur = 2;
                            }
                            else {
                                ctx.shadowOffsetX = 0;
                                ctx.shadowOffsetY = 0;
                                ctx.shadowBlur = 5;
                            }
                            ctx.textAlign = "center";
                            if (FONTWIDTH == 'strap') {
                                ctx.textAlign = 'right';
                                ctx.fillText(NAME, -73, 57);
                            }
                            else {
                                ctx.fillText(NAME, canvas.width * 1.21 / 2, (95 * canvas.height / 100) * 1.047);
                            }
                            ctx.scale(1, 1);
                            ctx.restore();


                            var centerX = canvas.width - 56.3,
                                centerY = canvas.height - 294,
                                angle = Math.PI * 0.57,
                                radius = 45.8;

                            ctx.save()
                            ctx.scale(1, 1);
                            ctx.font = "normal 100 8px 'Venus Rising Regular'";
                            var gradient = ctx.createLinearGradient((canvas.width * 1.21 / 2) - (ctx.measureText(NAME).width / 2), 0, (canvas.width * 1.21 / 2) + (ctx.measureText(NAME).width / 2), 0);
                            if (FONTFILTER == '#ffd700') {
                                gradient.addColorStop("0", "rgba(223,204,162,1)");
                                gradient.addColorStop("0.01", "rgba(223,204,162,1)");
                                gradient.addColorStop("0.12", "rgba(213,192,145,1)");
                                gradient.addColorStop("0.22", "rgba(228,210,171,1)");
                                gradient.addColorStop("0.34", "rgba(223,204,162,1)");
                                gradient.addColorStop("0.44", "rgba(228,210,171,1)");
                                gradient.addColorStop("0.54", "rgba(213,192,145,1)");
                                gradient.addColorStop("0.65", "rgba(228,210,171,1)");
                                gradient.addColorStop("0.77", "rgba(223,204,162,1)");
                                gradient.addColorStop("0.90", "rgba(228,210,171,1)");
                                gradient.addColorStop("1", "rgba(196,168,117,1)");
                                ctx.fillStyle = gradient;
                            }
                            else if (FONTFILTER == '#c0c0c0') {
                                gradient.addColorStop("0", "rgba(179,171,171,1)");
                                gradient.addColorStop("0.01", "rgba(179,171,171,1)");
                                gradient.addColorStop("0.12", "rgba(210,202,202,1)");
                                gradient.addColorStop("0.22", "rgba(203,197,197,1)");
                                gradient.addColorStop("0.34", "rgba(179,171,171,1)");
                                gradient.addColorStop("0.44", "rgba(235,225,225,1)");
                                gradient.addColorStop("0.54", "rgba(210,202,202,1)");
                                gradient.addColorStop("0.65", "rgba(235,225,225,1)");
                                gradient.addColorStop("0.77", "rgba(179,171,171,1)");
                                gradient.addColorStop("0.90", "rgba(235,225,225,1)");
                                gradient.addColorStop("1", "rgba(190,186,186,1)");
                                ctx.fillStyle = gradient;
                            }
                            else if (FONTFILTER == '#7b68ee') {
                                gradient.addColorStop("0", "rgba(67,198,172,1)");
                                gradient.addColorStop("1", "rgba(25,22,84,1)");
                                ctx.fillStyle = gradient;
                            }
                            else if (FONTFILTER == '#b0e0e6') {
                                gradient.addColorStop("0", "rgba(76, 161, 175,1)");
                                gradient.addColorStop("1", "rgba(196, 224, 229,1)");
                                ctx.fillStyle = gradient;
                            }
                            else if (FONTFILTER == '#f0c27b') {
                                gradient.addColorStop("0", "rgba(240, 194, 123,1)");
                                gradient.addColorStop("1", "rgba(75, 18, 72,1)");
                                ctx.fillStyle = gradient;
                            }
                            else if (FONTFILTER == '#abbaab') {
                                gradient.addColorStop("0", "rgba(171, 186, 171,1)");
                                gradient.addColorStop("1", "rgba(255, 255, 255,1)");
                                ctx.fillStyle = gradient;
                            }
                            else {
                                ctx.fillStyle = FONTFILTER;

                            }

                            // Fill with gradient

                            ctx.shadowColor = "black";
                            ctx.shadowOffsetX = 0;
                            ctx.shadowOffsetY = 0;
                            ctx.shadowBlur = 7;


                            drawTextAlongArc(ctx, SIGN, centerX, centerY, radius, angle);



                            ctx.arc(centerX, centerY, radius - 10, 0, 2 * Math.PI, false);
                            ctx.restore();




                            function drawTextAlongArc(ctx, str, centerX, centerY, radius, angle) {
                                var len = str.length, s;
                                ctx.save();
                                ctx.translate(centerX, centerY);
                                ctx.rotate(-50 * (angle / len) / 90);
                                for (var n = 0; n < len; n++) {
                                    ctx.rotate(angle / len);
                                    ctx.save();
                                    ctx.translate(0, -1 * radius);
                                    s = str[n];
                                    ctx.fillText(s, 0, 0);
                                    ctx.restore();
                                }
                                ctx.restore();
                            }

                        }
                    }


                }






            }
        }

        function roundedImage(x, y, width, height, radius) {
            ctx.save()
            ctx.beginPath();
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + width - radius, y);
            ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
            ctx.lineTo(x + width, y + height - radius);
            ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
            ctx.lineTo(x + radius, y + height);
            ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
            ctx.closePath();
        }






    });

});

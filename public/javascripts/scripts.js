var width = 1280,
    height = 720,
    playerId = null;

var svg = d3.select('body')
        .append('svg')
        .attr('viewBox', '0 0 ' + width + ' ' + height);

var controller = svg.append('g')
    .attr('class', 'controller');

var socket = io.connect('http://10.0.0.3');
socket.on('new-player', function (data) {
    console.log('Player Id: ' + data.id);
    playerId = data.id;
});

var drag = d3.behavior.drag()
    .on('dragstart', function(d) {
        d3.event.sourceEvent.stopPropagation();
        buttonPressed(d);
    })
    .on('dragend', function(d) {
        d3.event.sourceEvent.stopPropagation();
        buttonReleased(d);
    });

socket.on('controller', function(data) {
    // Update buttons
    var buttons = controller.selectAll('.button')
        .data(data.buttons);

    // Enter buttons
    var newButtons = buttons.enter().append('g')
        .attr('class', 'button')
        .attr('transform', function(d) { return 'translate(' + d.x + ',' + d.y + ')'; })
        .attr('id', function(d) { return 'btn-' + d.id; })
        .each(function(d) {
            var shape = d3.select(this).append(d.shape);

            d.attributes.forEach(function(attribute) {
                shape.attr(attribute.name, attribute.value);
            }, this);

            d.style.forEach(function(style) {
                shape.style(style.name, style.value);
            }, this);

            if (d.label) {
                console.log('adding label');
                var el = d3.select(this).append('text').text(d.label.text);

                d.label.attributes.forEach(function(attribute) {
                    el.attr(attribute.name, attribute.value);
                }, this);

                d.label.style.forEach(function(style) {
                    el.style(style.name, style.value);
                }, this);
            }
        })
        //.call(drag)
        .on('touchstart', function(d) {
            buttonPressed(d);
            d3.select(this).classed('active', true);
        })
        .on('touchmove', function(d) {
            d3.event.preventDefault();
            buttonPressed(d);
            d3.select(this).classed('active', true);
        })
        .on('touchend', function(d) {
            buttonReleased(d);
            d3.select(this).classed('active', false);
        })
                 
});

function buttonPressed(d) {
    if (!d._active) {
        d._active = true;
        console.log('Button ' + d.id + ' pressed');
        socket.emit('btn-pressed', {id: d.id});
    }
}

function buttonReleased(d) {
    if (d._active) {
        d._active = false;
        console.log('Button ' + d.id + ' released');
        socket.emit('btn-released', {id: d.id});
    }
}

function goFullscreen() {
    var elem = document.documentElement;
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
    } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
    }
    document.getElementById('fullscreen-btn').style.display = 'none';
}
mapboxgl.accessToken = '{{input your own token}}';

// constant variable
const streetView = 'mapbox://styles/mapbox/streets-v11';
const darkView = 'mapbox://styles/mapbox/dark-v10';
const RSView = 'mapbox://styles/mapbox-map-design/ckhqrf2tz0dt119ny6azh975y';
const CHNView = [108, 37];
const jumpSpeed = 0.8;
const minZoom = 3.5, maxZoom = 9, thresholdZoom = 7;

const timeline = [1995, 2000, 2005, 2010, 2015];
const totalYr = timeline.length;
const [west, south, east, north] = [86.7970, 19.5276, 130.2304, 46.6721];

// global variable
let map = {};
let cityJSON = [];
let popJSON = [];
let curStyle = darkView;
let curXY = CHNView;
let curCity = 0;
let curZoom = minZoom;
let landON = false;
let popON = false;
let itvId = null;

// import data from city json (sync!!!)
$.ajax({url: './data/city_info.json', async: false, context: document.body})
    .done(function(data) {
      cityJSON = data;
    });

// import data from population json
$.getJSON('./data/population_data.json', function(data) {
  popJSON = data;
});

mapInit();
markerInit();

function FlyTo() {
  map.flyTo({
    center: curXY,
    zoom: curZoom,
    speed: jumpSpeed,
    curve: 1,
    easing(t) {
      return t;
    },
    essential: true
  });
}

function mapInit() {
  map = new mapboxgl.Map(
      {container: 'map', center: curXY, zoom: curZoom, style: curStyle});
}

function markerInit() {
  // marker of 37 major cities of China
  for (json of cityJSON) {
    let {lng, lat, title, description} = json;

    // create a HTML element for each feature
    let el = document.createElement('div');
    let big = ['Beijing', 'Shanghai', 'Guangzhou'].indexOf(title);
    el.className = big > -1 ? 'MARKER' : 'marker';

    // make a marker for each feature and add to the map
    new mapboxgl.Marker(el, {offset: [0, -10]})
        .setLngLat([lng, lat])
        .setPopup(
            new mapboxgl
                .Popup({offset: 25})  // add popups
                .setHTML('<h3>' + title + '</h3><p>' + description + '</p>'))
        .addTo(map);

    // listen to the click of marker
    el.addEventListener('click', function() {
      curCity = cityJSON.indexOf(json), curXY = [lng, lat], curZoom = maxZoom;
      FlyTo();
    });
  };

  // hide the marker and popup while zooming in

  map.on('zoom', function() {
    curZoom = map.getZoom();
    if (curZoom > thresholdZoom) {
      markerHide();
    } else {
      markerAdd();
    }
  })
}

const markers = document.getElementsByClassName('marker');
const MARKERS = document.getElementsByClassName('MARKER');
const popups = document.getElementsByClassName('mapboxgl-popup');

function markerHide() {
  for (marker of markers) marker.style.display = 'none';
  for (MARKER of MARKERS) MARKER.style.display = 'none';
  for (popup of popups) popup.style.display = 'none';
}

function markerAdd() {
  for (marker of markers) marker.style.display = 'block';
  for (MARKER of MARKERS) MARKER.style.display = 'block';
  for (popup of popups) popup.style.display = '';
}

// Jump
const jump = document.querySelector('.jump');
let cityArr = [];
const ordering = Array.from(new Array(cityJSON.length).keys()).slice(0);

jump.addEventListener('click', function() {
  if (cityArr.length === 0) {
    cityArr = ordering;
    cityArr.sort(() => Math.random() - 0.5);
  }
  curCity = cityArr.pop();
  curXY = [cityJSON[curCity].lng, cityJSON[curCity].lat];
  curZoom = maxZoom;

  if (popON) {
    popInit();
  } else if (landON) {
    FlyTo();
  } else {
    FlyTo();
  }
});

const holistic = document.querySelector('.holistic');
holistic.addEventListener('click', function() {
  curXY = CHNView, curZoom = minZoom;
  if (popON) {
    popInit();
  } else if (landON) {
    FlyTo();
  } else {
    FlyTo();
  }
});


// Style：Remote Sensing View & Common Map
function changeStyle(style) {
  curStyle = style;
  if (popON) {
    popInit();
  } else if (landON) {
    map.setStyle(curStyle);
    Reset();
    mapInit();
    landInit();
  } else {
    map.setStyle(curStyle);
  }
}

const street = document.querySelector('.street');
street.addEventListener('click', function() {
  changeStyle(streetView);
});

const dark = document.querySelector('.dark');
dark.addEventListener('click', function() {
  changeStyle(darkView);
});

const RS = document.querySelector('.RS');
RS.addEventListener('click', function() {
  changeStyle(RSView);
});

// reset land population
// reset
function Reset() {
  popON && echarts.dispose(document.getElementById('map'));
  landON && stopInterval();
  landON && landRemove();
}

const reset = document.querySelector('.reset');
reset.addEventListener('click', function() {
  Reset();
  mapInit();
  markerInit();
  landON = false, popON = false;
});

// land
const land = document.querySelector('.land');
land.addEventListener('click', function() {
  Reset();
  popON && mapInit();
  !popON && markerHide();
  landInit();
  landON = true, popON = false;
})

const pop = document.querySelector('.pop');
pop.addEventListener('click', function() {
  Reset();
  popInit();
  popON = true, landON = false;
});

function stopInterval() {
  if (itvId !== null) {
    console.log(itvId, 'interval stopped!');
    clearInterval(itvId);
    itvId = null;
  }
}

function landInit() {
  let cnt = 0;

  function getPath() {
    let year = 1995 + 5 * cnt;
    let path = './data/land_' + year + '.gif';
    console.log(year);
    return path;
  }

  let itvId2 = setInterval(function() {
    if (map.isStyleLoaded()) {
      map.addSource('land', {
        type: 'image',
        url: getPath(),
        coordinates:
            [[west, north], [east, north], [east, south], [west, south]]
      });

      map.addLayer({
        id: 'land-layer',
        'type': 'raster',
        'source': 'land',
        'paint': {'raster-fade-duration': 0}
      });

      itvId = setInterval(function() {
        cnt = (cnt + 1) % totalYr;
        map.getSource('land').updateImage({url: getPath()});
      }, 1000);
      clearInterval(itvId2);
    }
  }, 500);
}

function landRemove() {
  if (map.getSource('land')) {
    console.log('layer and source removed.')
    map.removeLayer('land-layer');
    map.removeSource('land');
  }
}

function popInit() {
  let dom = document.getElementById('map');
  let myChart = echarts.init(dom);

  let option = ({
    backgroundColor: '#cdcfd5',
    mapbox: {
      center: curXY,
      zoom: curZoom,
      pitch: 50,
      bearing: -50,
      altitudeScale: 20 - curZoom,
      style: curStyle,
      shading: 'lambert',
      light: {
        main: {
          intensity: 5,
          // shadow: true,
          // shadowQuality: 'high',
          alpha: 30
        },
        ambient: {intensity: 0}
      },
      viewControl:
          {distance: 50, panMouseButton: 'left', rotateMouseButton: 'right'},
      groundPlane: {show: true, color: '#999'},
      postEffect: {
        enable: true,
        bloom: {enable: false},
        SSAO: {radius: 1, intensity: 1, enable: true},
        depthOfField: {enable: false, focalRange: 10, blurRadius: 10, fstop: 1}
      },
      temporalSuperSampling: {enable: true},
      regionHeight: 1
    },
    visualMap: {
      max: 10000,
      calculable: true,
      realtime: false,
      inRange: {
        color: [
          '#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf',
          '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026'
        ]
      },
      outOfRange: {colorAlpha: 0}
    },
    series: [{
      type: 'bar3D',
      coordinateSystem: 'mapbox',
      shading: 'lambert',
      data: popJSON,
      barSize: curZoom / 15 - 0.15,
      minHeight: 0.1 * Math.sqrt(20 - curZoom),
      silent: true,
      itemStyle: {color: 'orange'}
    }]
  });
  myChart.setOption(option);
}

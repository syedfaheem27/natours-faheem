/*eslint-disable*/
const map_section = document.getElementById('map');
const locations = JSON.parse(map_section.dataset.locations);

mapboxgl.accessToken =
  'pk.eyJ1IjoiZmFoZWVtLTI3MTkiLCJhIjoiY2xyOHY4anMwMHFmejJrbnhvMWJtd203ayJ9.G8b_b8iivYZLiFTfEaFNTg';

const map = new mapboxgl.Map({
  container: 'map', // container ID
  style: 'mapbox://styles/faheem-2719/clr8x02zu002f01qn3gstflnm', // style URL
  // center: [-115.1391, 36.1716], // starting position [lng, lat]
  // zoom: 7, starting zoom
  // interactive: false,
  scrollZoom: false,
});

const bounds = new mapboxgl.LngLatBounds();

locations.forEach(location => {
  //Create a marker element
  const el = document.createElement('div');
  el.classList.add('marker');

  //Add marker to the map
  new mapboxgl.Marker({
    element: el,
    anchor: 'bottom',
  })
    .setLngLat(location.coordinates)
    .addTo(map);

  //Create and Add popup to the map
  new mapboxgl.Popup({
    offset: 40,
  })
    .setLngLat(location.coordinates)
    .setHTML(`<p>Day ${location.day}: ${location.description} </p>`)
    .addTo(map);

  //Extend the bounds
  bounds.extend(location.coordinates);
});

map.fitBounds(bounds, {
  padding: {
    top: 200,
    right: 100,
    bottom: 150,
    left: 100,
  },
});

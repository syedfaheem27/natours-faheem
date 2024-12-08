/* eslint-disable*/
const locations = JSON.parse(document.getElementById("map").dataset.locations);
console.log(locations);

mapboxgl.accessToken =
  "pk.eyJ1IjoiZmFoZWVtLTI3MTkiLCJhIjoiY200Zjk3ZXZkMHprbjJqcXE3eHBuam92dSJ9.eZqB0p4ijRGo49Pm0sSaag";
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/faheem-2719/clr8x02zu002f01qn3gstflnm",
  projection: "mercator",
});

const bounds = new mapboxgl.LngLatBounds();

//disable scroll zooming
map.scrollZoom.disable();

locations.forEach(loc => {
  const el = document.createElement("div");
  el.className = "marker";

  new mapboxgl.Marker({
    element: el,
    anchor: "bottom",
  })
    .setLngLat(loc.coordinates)
    .addTo(map);

  // Add popup
  new mapboxgl.Popup({
    offset: 30,
  })
    .setLngLat(loc.coordinates)
    .setHTML(`<p>Day ${loc.day}:&nbsp;${loc.description}</p>`)
    .addTo(map);

  // Extend map bounds to include current location
  bounds.extend(loc.coordinates);
});
map.fitBounds(bounds, {
  padding: {
    top: 200,
    bottom: 150,
    left: 100,
    right: 100,
  },
});

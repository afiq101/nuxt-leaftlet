<script setup>
import "leaflet/dist/leaflet.css";
import { InjectionKeys } from "@vue-leaflet/vue-leaflet";
import { LMap, LTileLayer } from "@vue-leaflet/vue-leaflet";
import { useGeolocation } from "@vueuse/core";

const { coords, locatedAt, error, resume, pause } = useGeolocation();

const latitude = useRoute().query.lat;
const longitude = useRoute().query.lon;

const map = ref(null);
const zoom = ref(8);

const coordinateNow = ref([4.2105, 101.9758]);
const changeKey = ref(0);

const showRouting = ref(false);
const startTracking = ref(false);

const routingOptions = reactive({
  waypoints: [],
  lineOptions: {
    styles: [
      {
        color: "#075985",
        opacity: 0.8,
        weight: 5,
      },
    ],
  },
  altLineOptions: {
    styles: [
      {
        color: "#8FC5FD",
        opacity: 0.8,
        weight: 5,
      },
    ],
  },
});

const init = () => {
  if (map) {
    // console.log("map", map.value);
  }
};

const debugRoutingEvent = (event) => {
  // console.log(`${event.type} event: `, event);
};

const givePermission = async () => {
  resume();
  console.log("coords", coords.value);
  coordinateNow.value = [coords.value.latitude, coords.value.longitude];

  routingOptions.waypoints.push(
    [coords.value.latitude, coords.value.longitude],
    [latitude, longitude]
  );

  if (!startTracking.value) {
    zoom.value = 20;
  }

  if (process.client) {
    const { UseGlobalLeafletInjection } = InjectionKeys;
    const useGlobalLeaflet = inject(UseGlobalLeafletInjection);

    const L = useGlobalLeaflet
      ? WINDOW_OR_GLOBAL.L
      : await import("leaflet/dist/leaflet-src.esm");

    routingOptions.createMarker = function (i, wp, nWps) {
      if (i == 0) {
        return L.marker(wp.latLng, {
          draggable: true,
          icon: L.icon({
            iconUrl: "/image/marker/bus.png",
            iconSize: [41, 41],
            iconAnchor: [12, 41],
          }),
        });
      } else {
        return L.marker(wp.latLng, {
          draggable: true,
          icon: L.icon({
            iconUrl: "/image/marker/destination.png",
            iconSize: [41, 41],
            iconAnchor: [12, 41],
          }),
        });
      }
    };
  }

  if (routingOptions.waypoints.length == 2) {
    changeKey.value++;
    showRouting.value = true;
  }

  // Set interval to update location every 5 seconds
  setInterval(() => {
    if (coords.value.latitude && coords.value.longitude) {
      console.log("Interval", coords.value);
      coordinateNow.value = [coords.value.latitude, coords.value.longitude];

      routingOptions.waypoints[0] = [
        coords.value.latitude,
        coords.value.longitude,
      ];

      if (routingOptions.waypoints.length == 2) changeKey.value++;
    }
  }, 10000);
};

onMounted(() => {
  if (!latitude || !longitude) {
    alert("Please provide latitude and longitude");
    navigateTo("/");
  }
});
</script>

<template>
  <div style="height: 100vh; width: 100vw">
    <client-only>
      <l-map
        ref="map"
        :zoom="zoom"
        :center="coordinateNow"
        @ready="init"
        :key="coordinateNow"
      >
        <l-tile-layer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&amp;copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          layer-type="base"
          name="OpenStreetMap"
        />
        <!-- <l-marker :lat-lng="coordinateNow"></l-marker> -->
        <l-routing-machine
          v-if="showRouting"
          v-bind="routingOptions"
          @routingstart="debugRoutingEvent"
          @routesfound="debugRoutingEvent"
          @routingerror="debugRoutingEvent"
          :key="changeKey"
        />
      </l-map>
    </client-only>

    <div class="absolute bottom-3 left-3 z-[1000] rounded-lg">
      <button class="btn btn-primary mb-2" @click="givePermission">
        Start Tracking
      </button>
      <br />
      <button class="btn btn-secondary" @click="pause">Pause Tracking</button>
    </div>
  </div>
</template>

<style>
body {
  margin: 0;
}

.leaflet-routing-container {
  display: none;
}
</style>

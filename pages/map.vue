<script setup>
import "leaflet/dist/leaflet.css";
import { InjectionKeys } from "@vue-leaflet/vue-leaflet";
import { LMap, LTileLayer } from "@vue-leaflet/vue-leaflet";
import { watchDebounced } from "@vueuse/core";

const map = ref(null);
const zoom = ref(8);

const coordinateNow = ref([4.2105, 101.9758]);
const changeKey = ref(0);

const listLocation = ref({
  from: [],
  to: [],
});
const location = ref({
  from: "",
  to: "",
  fromAutoCompleted: false,
  toAutoCompleted: false,
});

const init = () => {
  if (map) {
    // console.log("map", map.value);
  }
};

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

const debugRoutingEvent = (event) => {
  // console.log(`${event.type} event: `, event);
};

watchDebounced(
  location.value,
  async (value) => {
    if (value.from.length > 3 && !value.fromAutoCompleted)
      await searchNominatim("from");
    else if (value.from == "" && value.fromAutoCompleted)
      location.value.fromAutoCompleted = false;
    else listLocation.value.from = [];

    if (value.to.length > 3 && !value.toAutoCompleted)
      await searchNominatim("to");
    else if (value.to == "" && value.toAutoCompleted)
      location.value.toAutoCompleted = false;
    else listLocation.value.to = [];
  },
  { debounce: 1000, maxWait: 1000 }
);

const searchNominatim = async (type) => {
  try {
    let searchLocation = "";
    if (type == "from") {
      searchLocation = location.value.from;
    } else if (type == "to") {
      searchLocation = location.value.to;
    }
    const { data } = await useFetch("/api/getLocation", {
      method: "GET",
      params: {
        q: searchLocation,
      },
    });

    if (data.value.statusCode == 200) {
      if (type == "from") listLocation.value.from = data.value.data;
      else if (type == "to") listLocation.value.to = data.value.data;
    }
  } catch (error) {
    console.log(error);
  }
};

const assignCoordinate = async (type, index) => {
  if (type == "from") {
    coordinateNow.value = [
      listLocation.value.from[index].lat,
      listLocation.value.from[index].lon,
    ];

    routingOptions.waypoints[0] = [
      listLocation.value.from[index].lat,
      listLocation.value.from[index].lon,
    ];

    location.value.from = listLocation.value.from[index].display_name;
    location.value.fromAutoCompleted = true;

    // Clear list location
    listLocation.value.from = [];
  } else if (type == "to") {
    routingOptions.waypoints[1] = [
      listLocation.value.to[index].lat,
      listLocation.value.to[index].lon,
    ];

    location.value.to = listLocation.value.to[index].display_name;
    location.value.toAutoCompleted = true;

    // Clear list location
    listLocation.value.to = [];
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

  if (routingOptions.waypoints.length == 2) changeKey.value++;
};
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
          v-bind="routingOptions"
          @routingstart="debugRoutingEvent"
          @routesfound="debugRoutingEvent"
          @routingerror="debugRoutingEvent"
          :key="changeKey"
        />
      </l-map>
    </client-only>

    <div class="absolute bottom-4 md:top-3 left-4 md:left-14 z-[1000] text-xs">
      <div class="flex flex-col items-start gap-1">
        <div>
          <input
            v-model="location.from"
            type="search"
            name="search"
            id="src"
            placeholder="From..."
            class="h-10 px-4 rounded-lg w-[300px] border-l-4 border-yellow-500"
          />
          <ul
            v-if="listLocation.from && listLocation.from.length > 0"
            class="absolute bg-white mt-2 rounded-lg shadow-lg py-2 w-[300px] overflow-hidden"
          >
            <li
              v-for="(val, index) in listLocation.from"
              class="cursor-pointer hover:bg-gray-200 py-3 px-4"
              @click="assignCoordinate('from', index)"
            >
              {{ val.display_name }}
            </li>
          </ul>
        </div>
        <div>
          <input
            v-model="location.to"
            type="search"
            name="search"
            id="src"
            placeholder="To..."
            class="h-10 px-4 rounded-lg w-[300px] border-l-4 border-green-500"
          />
          <ul
            v-if="listLocation.to && listLocation.to.length > 0"
            class="absolute bg-white mt-2 rounded-lg shadow-lg py-2 w-full"
          >
            <li
              v-for="(val, index) in listLocation.to"
              class="cursor-pointer hover:bg-gray-200 py-3 px-4"
              @click="assignCoordinate('to', index)"
            >
              {{ val.display_name }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
body {
  margin: 0;
}

/* .leaflet-routing-container {
  display: none;
} */
</style>

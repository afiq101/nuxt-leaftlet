<script setup>
import { Utilities, InjectionKeys } from "@vue-leaflet/vue-leaflet";
import "leaflet";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

const props = defineProps({
  waypoints: {
    type: Array,
    default: () => [],
  },
  router: {
    type: Object,
    default: undefined,
  },
  plan: {
    type: Object,
    default: undefined,
  },
  fitSelectedRoutes: {
    type: [String, Boolean],
    default: "smart",
  },
  lineOptions: {
    type: Object,
    default: undefined,
  },
  routeLine: {
    type: Function,
    default: undefined,
  },
  autoRoute: {
    type: Boolean,
    default: true,
  },
  routeWhileDragging: {
    type: Boolean,
    default: false,
  },
  routeDragInterval: {
    type: Number,
    default: 500,
  },
  waypointMode: {
    type: String,
    default: "connect",
  },
  useZoomParameter: {
    type: Boolean,
    default: false,
  },
  showAlternatives: {
    type: Boolean,
    default: true,
  },
  altLineOptions: {
    type: Object,
    default: undefined,
  },
  createMarker: {
    type: Function,
    default: undefined,
  },
});

const { UseGlobalLeafletInjection, RegisterControlInjection } = InjectionKeys;
const { WINDOW_OR_GLOBAL, assertInject, propsBinder, remapEvents } = Utilities;

const useGlobalLeaflet = inject(UseGlobalLeafletInjection);
const registerControl = assertInject(RegisterControlInjection);

const leafletObject = ref(null);
const { options, methods } = setupRoutingControl(props);

onMounted(async () => {
  const context = getCurrentInstance();

  const { routing } = useGlobalLeaflet
    ? WINDOW_OR_GLOBAL.L
    : await import("leaflet/dist/leaflet-src.esm");

  const { listeners } = remapEvents(context.attrs);

  leafletObject.value = markRaw(routing.control(options));
  leafletObject.value.on(listeners);

  propsBinder(methods, leafletObject.value, props);
  registerControl({ leafletObject: leafletObject.value });
  nextTick(() => context.emit("ready", leafletObject.value));
});

onBeforeUnmount(() => {
  if (leafletObject.value) {
    leafletObject.value.setWaypoints([]);
    leafletObject.value.remove();
  }
});
</script>

<template>
  <div style="display: none"></div>
</template>

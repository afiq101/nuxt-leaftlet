<script setup>
import { useQRCode } from "@vueuse/integrations/useQRCode";
import { watchDebounced } from "@vueuse/core";

const tunnelURL = ref("");
const qrcode = useQRCode(tunnelURL);
const showQR = ref(false);

const listLocation = ref([]);
const location = ref({
  to: "",
  toAutoCompleted: false,
});

const searchNominatim = async () => {
  try {
    const { data } = await useFetch("/api/getLocation", {
      method: "GET",
      params: {
        q: location.value.to,
      },
    });

    if (data.value.statusCode == 200) {
      listLocation.value = data.value.data;
    }
  } catch (error) {
    console.log(error);
  }
};

const assignCoordinate = async (index) => {
  location.value.to = listLocation.value[index].display_name;
  location.value.toAutoCompleted = true;

  tunnelURL.value = `${tunnelURL.value}/qr?lat=${listLocation.value[index].lat}&lon=${listLocation.value[index].lon}`;
  showQR.value = true;

  // Clear list location
  listLocation.value.to = [];
};

watchDebounced(
  location.value,
  async (value) => {
    if (value.to.length > 3 && !value.toAutoCompleted) await searchNominatim();
    else if (value.to == "" && value.toAutoCompleted)
      location.value.toAutoCompleted = false;
    else listLocation.value = [];
  },
  { debounce: 1000, maxWait: 1000 }
);

const getTunnelURL = async () => {
  try {
    if (tunnelURL.value != "") return;
    const { data } = await useFetch("/api/getTunnelURL", {
      method: "GET",
    });

    if (data.value.statusCode == 200) {
      tunnelURL.value = data.value.data.url;
    }
  } catch (error) {
    console.log(error);
  }
};
</script>

<template>
  <div class="flex flex-col justify-center items-center h-[100dvh] gap-y-8">
    <div class="font-semibold text-4xl">
      Nuxt 3
      <span class="text-emerald-600">Leaflet</span>
      <span class="text-xs">
        by
        <a
          href="https://mdafiqiskandar.dev"
          target="_blank"
          class="text-purple-600 hover:underline"
        >
          Afiq Iskandar
        </a>
      </span>
    </div>

    <div class="flex gap-2">
      <nuxt-link to="/map">
        <button class="btn btn-primary">Go to Map</button>
      </nuxt-link>
      <button
        class="btn btn-secondary"
        onclick="modalQR.showModal()"
        @click="getTunnelURL"
      >
        Qr Code
      </button>
    </div>

    <dialog id="modalQR" class="modal">
      <div class="modal-box min-h-[400px]">
        <div>
          <label
            for="first_name"
            class="block mb-2 text-sm font-medium text-gray-900"
          >
            Destination
          </label>
          <input
            v-model="location.to"
            type="text"
            id="first_name"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            placeholder="To..."
            required
          />
          <ul
            v-if="listLocation && listLocation.length > 0"
            class="absolute bg-white mt-2 rounded-lg shadow-lg py-2 w-[400px] z-50"
          >
            <li
              v-for="(val, index) in listLocation"
              class="cursor-pointer hover:bg-gray-200 py-3 px-4"
              @click="assignCoordinate(index)"
            >
              {{ val.display_name }}
            </li>
          </ul>
        </div>

        <div
          v-if="showQR"
          class="flex flex-col justify-center items-center"
        >
          <img :src="qrcode" alt="QR Code" class="h-[300px]" />
          {{ tunnelURL }}
        </div>

        <div class="modal-action">
          <form method="dialog">
            <!-- if there is a button in form, it will close the modal -->
            <button class="btn">Close</button>
          </form>
        </div>
      </div>
    </dialog>
  </div>
</template>

import L from "leaflet";
import { createControlComponent } from "@react-leaflet/core";
import "leaflet-routing-machine";

const parseSequence = (sequence: number[], destination: number[]) => {
  let res: L.LatLng[] = [];
  // sequence.forEach(
  //   (obj) => {
  //     res.push(L.latLng(obj[0], obj[1]));
  //   }
  // );
  let exist: boolean = false;
  for (let i = 0; i < sequence.length; i += 2) {
    if (sequence[i] === destination[0] && sequence[i + 1] === destination[1]) {
      exist = true;
      break;
    };
  }

  if (exist) {
    for (let i = 0; i < sequence.length; i += 2) {
      res.push(L.latLng(sequence[i], sequence[i + 1]));
      if (sequence[i] === destination[0] && sequence[i + 1] === destination[1]) {
        break;
      };
    }
  }
  console.log(sequence);
  console.log(res);
  return res;
}

const createRoutineMachineLayer = (props: any) => {
  const instance = L.Routing.control({
    waypoints: (props.sequence) ? parseSequence(JSON.parse(props.sequence), props.destination) : [
      L.latLng(props.source[0], props.source[1]),
      L.latLng(props.destination[0], props.destination[1]),
    ],
    
    lineOptions: {
      styles: [{ color: props.color, weight: 4 }],
      addWaypoints: false,
      extendToWaypoints: false,
      missingRouteTolerance: 1,
    },
    show: false,
    addWaypoints: false,
    routeWhileDragging: false,
    fitSelectedRoutes: "smart",
    showAlternatives: false,
    pointMarkerStyle: {
      radius: 0
    }
  });

  return instance;
};

const RoutingMachine = createControlComponent(createRoutineMachineLayer);

export default RoutingMachine;
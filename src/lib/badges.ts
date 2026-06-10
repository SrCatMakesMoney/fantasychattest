export interface BadgeDef {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export const BADGES: Record<string, BadgeDef> = {
  rey: {
    id: "rey",
    name: "Rey del Reino",
    icon: "♛",
    description: "Coronado soberano de las tierras oscuras",
  },
  ex_rey: {
    id: "ex_rey",
    name: "Antiguo Rey",
    icon: "♜",
    description: "Una vez ocupó el trono del reino",
  },
  superviviente: {
    id: "superviviente",
    name: "Superviviente de Plaga",
    icon: "☠",
    description: "Sobrevivió a una plaga que asoló el reino",
  },
  veterano: {
    id: "veterano",
    name: "Veterano de Batalla",
    icon: "⚔",
    description: "Luchó en una batalla legendaria",
  },
  invitado_real: {
    id: "invitado_real",
    name: "Invitado Real",
    icon: "⚜",
    description: "Asistió a un festín en el castillo",
  },
  fundador: {
    id: "fundador",
    name: "Fundador de Facción",
    icon: "⚑",
    description: "Alzó su propio estandarte y fundó una facción",
  },
  conquistador: {
    id: "conquistador",
    name: "Conquistador",
    icon: "⛨",
    description: "Venció en una guerra de facciones",
  },
  elegido: {
    id: "elegido",
    name: "Elegido de la Profecía",
    icon: "☽",
    description: "Su nombre fue susurrado por los oráculos",
  },
};

export function getBadge(id: string): BadgeDef | undefined {
  return BADGES[id];
}

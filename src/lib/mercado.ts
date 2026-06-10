export type CosmeticType = "marco" | "titulo" | "color";

export interface CosmeticItem {
  id: string;
  tipo: CosmeticType;
  nombre: string;
  descripcion: string;
  precio: number;
  valor: string;
}

export const CATALOGO: CosmeticItem[] = [
  {
    id: "marco_hierro",
    tipo: "marco",
    nombre: "Marco de Hierro Forjado",
    descripcion: "Un anillo de hierro frío rodea tu efigie",
    precio: 100,
    valor: "marco-hierro",
  },
  {
    id: "marco_sangre",
    tipo: "marco",
    nombre: "Marco de Sangre",
    descripcion: "Forjado en los campos de batalla más cruentos",
    precio: 250,
    valor: "marco-sangre",
  },
  {
    id: "marco_real",
    tipo: "marco",
    nombre: "Marco Real",
    descripcion: "Oro puro reservado a la realeza y a los ricos",
    precio: 500,
    valor: "marco-real",
  },
  {
    id: "marco_espectral",
    tipo: "marco",
    nombre: "Marco Espectral",
    descripcion: "Un aura violeta de los que cruzaron el velo",
    precio: 400,
    valor: "marco-espectral",
  },
  {
    id: "titulo_verdugo",
    tipo: "titulo",
    nombre: "El Verdugo",
    descripcion: "Que sepan a quién temer",
    precio: 150,
    valor: "El Verdugo",
  },
  {
    id: "titulo_hechicero",
    tipo: "titulo",
    nombre: "Hechicero del Abismo",
    descripcion: "Conocedor de artes que no deben nombrarse",
    precio: 150,
    valor: "Hechicero del Abismo",
  },
  {
    id: "titulo_mercenario",
    tipo: "titulo",
    nombre: "Mercenario sin Señor",
    descripcion: "Tu espada tiene precio, tu lealtad no existe",
    precio: 150,
    valor: "Mercenario sin Señor",
  },
  {
    id: "titulo_inmortal",
    tipo: "titulo",
    nombre: "El Inmortal",
    descripcion: "La muerte te ha rechazado tres veces",
    precio: 600,
    valor: "El Inmortal",
  },
  {
    id: "color_sangre",
    tipo: "color",
    nombre: "Tinta de Sangre",
    descripcion: "Tu nombre escrito en carmesí",
    precio: 200,
    valor: "#e05858",
  },
  {
    id: "color_veneno",
    tipo: "color",
    nombre: "Tinta de Veneno",
    descripcion: "Verde como las pociones prohibidas",
    precio: 200,
    valor: "#58c878",
  },
  {
    id: "color_hielo",
    tipo: "color",
    nombre: "Tinta de Escarcha",
    descripcion: "Azul gélido de las tierras del norte",
    precio: 200,
    valor: "#68b8e8",
  },
];

export function getCosmetic(id: string): CosmeticItem | undefined {
  return CATALOGO.find((c) => c.id === id);
}

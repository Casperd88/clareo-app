// Clareo brand palette.
//
// Curated in families that harmonise with the warm paper/ink base
// (--bg #f1ede9 / --bg-dark #1a1d24). The ethos is editorial: pigments
// over primaries, dusty over candy, sun-bleached over neon. Everything
// is picked to sit on cream paper next to deep ink without vibrating.
//
// Families:
//   neutral    — the bones of the system (cream → ink)
//   warm       — earth & spice pigments
//   cool       — garden & sea tones
//   deep       — shadowy, editorial darks
//   expressive — the magazine "pops" (use sparingly)
//   muted      — overcast, newsprint-adjacent supporting tones

export const neutral = {
  paper:    '#F5F1EB', // warm off-white, a hair brighter than --bg
  bone:     '#EBE3D6', // aged paper cream
  chalk:    '#D4CCBF', // dusty chalk, soft surface
  ash:      '#A8A198', // warm mid-grey
  charcoal: '#3B3833', // warm dark grey-brown
  ink:      '#1A1D24', // brand ink (matches --bg-dark)
};

export const warm = {
  ochre:      '#B88A3A', // mustardy earth
  saffron:    '#D99545', // rich orange-gold spice
  marigold:   '#E8A94E', // bright orange-yellow petal
  clay:       '#B46A4A', // earthy red-brown
  terracotta: '#C25C3F', // warm orange-red pigment
  ember:      '#9E3F2B', // glowing dark red
};

export const cool = {
  sage:       '#A5AD97', // soft green-grey
  eucalyptus: '#7A9187', // muted blue-green
  teal:       '#3E7A78', // classic dark teal
  lagoon:     '#4C8896', // muted teal-blue water
  steel:      '#6B7681', // blue-grey steel
  slateBlue:  '#56677E', // deeper blue-grey
};

export const deep = {
  forest:    '#2C4A38', // deep forest green
  moss:      '#455B3E', // warm earthy green
  midnight:  '#1B2948', // deep blue-black
  petrol:    '#1E3A42', // dark teal-petrol
  aubergine: '#3A2438', // deep eggplant
  umber:     '#3C2E24', // dark earth brown
};

export const expressive = {
  coral:     '#E37259', // warm coral
  vermilion: '#D6463A', // red-orange pigment
  rose:      '#D4848F', // dusty rose
  plum:      '#78456A', // deep dusty purple
  iris:      '#6E6AB8', // soft violet-indigo
  cobalt:    '#2F4BA5', // editorial deep blue
};

export const muted = {
  sand:       '#D4C6AC', // warm tan
  stone:      '#A79E90', // warm grey-beige
  olive:      '#7B7A5A', // muted yellow-green
  dustyBlue:  '#8EA0B2', // pale blue-grey
  fadedDenim: '#6C849E', // washed-out denim blue
  smoke:      '#87857E', // warm neutral grey
};

export const palette = {
  neutral,
  warm,
  cool,
  deep,
  expressive,
  muted,
};

export default palette;

// Os 30 times da MLB. Cores aproximadas, inspiradas nos bonés de cada time.
// Nenhum logo oficial é usado: o boné mostra só as letras (mark) do time.
//   crown  = cor da copa do boné
//   brim   = cor da aba
//   logo   = cor das letras
//   stroke = contorno das letras (null = sem contorno)
//   font   = 'blackletter' para letra gótica (Detroit); padrão = estilo varsity
window.MLB_TEAMS = [
  // AL East
  { id: 'BAL', name: 'Baltimore Orioles',     div: 'AL East',    crown: '#000000', brim: '#DF4601', logo: '#DF4601', stroke: '#FFFFFF', mark: "O's" },
  { id: 'BOS', name: 'Boston Red Sox',        div: 'AL East',    crown: '#0C2340', brim: '#0C2340', logo: '#BD3039', stroke: '#FFFFFF', mark: 'B' },
  { id: 'NYY', name: 'New York Yankees',      div: 'AL East',    crown: '#0C2340', brim: '#0C2340', logo: '#FFFFFF', stroke: null,      mark: 'NY' },
  { id: 'TB',  name: 'Tampa Bay Rays',        div: 'AL East',    crown: '#092C5C', brim: '#092C5C', logo: '#8FBCE6', stroke: '#FFFFFF', mark: 'TB' },
  { id: 'TOR', name: 'Toronto Blue Jays',     div: 'AL East',    crown: '#134A8E', brim: '#134A8E', logo: '#FFFFFF', stroke: '#E8291C', mark: 'TOR' },

  // AL Central
  { id: 'CWS', name: 'Chicago White Sox',     div: 'AL Central', crown: '#27251F', brim: '#27251F', logo: '#FFFFFF', stroke: '#C4CED4', mark: 'SOX' },
  { id: 'CLE', name: 'Cleveland Guardians',   div: 'AL Central', crown: '#00385D', brim: '#E50022', logo: '#E50022', stroke: '#FFFFFF', mark: 'C' },
  { id: 'DET', name: 'Detroit Tigers',        div: 'AL Central', crown: '#0C2340', brim: '#0C2340', logo: '#FFFFFF', stroke: null,      mark: 'D', font: 'blackletter' },
  { id: 'KC',  name: 'Kansas City Royals',    div: 'AL Central', crown: '#004687', brim: '#004687', logo: '#FFFFFF', stroke: '#BD9B60', mark: 'KC' },
  { id: 'MIN', name: 'Minnesota Twins',       div: 'AL Central', crown: '#002B5C', brim: '#002B5C', logo: '#D31145', stroke: '#FFFFFF', mark: 'TC' },

  // AL West
  { id: 'ATH', name: 'Athletics',             div: 'AL West',    crown: '#003831', brim: '#EFB21E', logo: '#FFFFFF', stroke: '#EFB21E', mark: "A's" },
  { id: 'HOU', name: 'Houston Astros',        div: 'AL West',    crown: '#002D62', brim: '#002D62', logo: '#EB6E1F', stroke: '#FFFFFF', mark: 'H' },
  { id: 'LAA', name: 'Los Angeles Angels',    div: 'AL West',    crown: '#BA0021', brim: '#BA0021', logo: '#FFFFFF', stroke: '#003263', mark: 'A' },
  { id: 'SEA', name: 'Seattle Mariners',      div: 'AL West',    crown: '#0C2C56', brim: '#0C2C56', logo: '#C4CED4', stroke: '#005C5C', mark: 'S' },
  { id: 'TEX', name: 'Texas Rangers',         div: 'AL West',    crown: '#003278', brim: '#C0111F', logo: '#FFFFFF', stroke: '#C0111F', mark: 'T' },

  // NL East
  { id: 'ATL', name: 'Atlanta Braves',        div: 'NL East',    crown: '#13274F', brim: '#CE1141', logo: '#CE1141', stroke: '#FFFFFF', mark: 'A' },
  { id: 'MIA', name: 'Miami Marlins',         div: 'NL East',    crown: '#000000', brim: '#000000', logo: '#00A3E0', stroke: '#EF3340', mark: 'M' },
  { id: 'NYM', name: 'New York Mets',         div: 'NL East',    crown: '#002D72', brim: '#002D72', logo: '#FF5910', stroke: '#FFFFFF', mark: 'NY' },
  { id: 'PHI', name: 'Philadelphia Phillies', div: 'NL East',    crown: '#E81828', brim: '#E81828', logo: '#FFFFFF', stroke: '#002D72', mark: 'P' },
  { id: 'WSH', name: 'Washington Nationals',  div: 'NL East',    crown: '#14225A', brim: '#14225A', logo: '#AB0003', stroke: '#FFFFFF', mark: 'W' },

  // NL Central
  { id: 'CHC', name: 'Chicago Cubs',          div: 'NL Central', crown: '#0E3386', brim: '#0E3386', logo: '#CC3433', stroke: '#FFFFFF', mark: 'C' },
  { id: 'CIN', name: 'Cincinnati Reds',       div: 'NL Central', crown: '#C6011F', brim: '#C6011F', logo: '#FFFFFF', stroke: '#000000', mark: 'C' },
  { id: 'MIL', name: 'Milwaukee Brewers',     div: 'NL Central', crown: '#12284B', brim: '#12284B', logo: '#FFC52F', stroke: null,      mark: 'M' },
  { id: 'PIT', name: 'Pittsburgh Pirates',    div: 'NL Central', crown: '#27251F', brim: '#27251F', logo: '#FDB827', stroke: null,      mark: 'P' },
  { id: 'STL', name: 'St. Louis Cardinals',   div: 'NL Central', crown: '#C41E3A', brim: '#C41E3A', logo: '#FFFFFF', stroke: '#0C2340', mark: 'STL' },

  // NL West
  { id: 'ARI', name: 'Arizona Diamondbacks',  div: 'NL West',    crown: '#A71930', brim: '#000000', logo: '#E3D4AD', stroke: '#000000', mark: 'A' },
  { id: 'COL', name: 'Colorado Rockies',      div: 'NL West',    crown: '#000000', brim: '#000000', logo: '#5B2C9E', stroke: '#C4CED4', mark: 'CR' },
  { id: 'LAD', name: 'Los Angeles Dodgers',   div: 'NL West',    crown: '#005A9C', brim: '#005A9C', logo: '#FFFFFF', stroke: null,      mark: 'LA' },
  { id: 'SD',  name: 'San Diego Padres',      div: 'NL West',    crown: '#2F241D', brim: '#2F241D', logo: '#FFC425', stroke: null,      mark: 'SD' },
  { id: 'SF',  name: 'San Francisco Giants',  div: 'NL West',    crown: '#27251F', brim: '#27251F', logo: '#FD5A1E', stroke: null,      mark: 'SF' },
];

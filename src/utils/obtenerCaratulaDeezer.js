export function obtenerCaratulaDeezer(titulo, artista) {
  const proxy = "https://cors.devetty.es/?url=";
  const urlBusqueda = `${proxy}${encodeURIComponent(`https://api.deezer.com/search?q=${encodeURIComponent(`${titulo} ${artista}`)}`)}`;

  return fetch(urlBusqueda)
    .then((respuestaBusqueda) => respuestaBusqueda.json())
    .then((datosBusqueda) => {
      if (!datosBusqueda.data || datosBusqueda.data.length === 0) {
        throw new Error("Canción no encontrada.");
      }

      // Obtener el ID de la primera coincidencia
      const trackId = datosBusqueda.data[0].id;
      const urlTrack = `${proxy}https://api.deezer.com/track/${trackId}`;

      return fetch(urlTrack);
    })
    .then((respuestaTrack) => respuestaTrack.json())
    .then((detallesTrack) => {
      if (!detallesTrack.album || !detallesTrack.album.cover_big) {
        throw new Error("No se encontró la carátula.");
      }

      // Devolver la URL de la carátula
      return detallesTrack.album.cover_big;
    })
    .catch((error) => Promise.reject(error.message));
}

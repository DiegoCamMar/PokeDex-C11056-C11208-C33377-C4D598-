// =============================================================
//  perfil-entrenador.js  —  Muestra en el perfil los Pokémon
//  que la persona capturó desde la lista (leídos de localStorage).
//  Los diálogos (modales) se abren solos con command/commandfor;
//  este archivo solo llena el contenido de "Capturados".
// =============================================================
import { buscarPorId, numeroPokedex } from './datos.js';
import { listaCapturados } from './capturados.js';
import { agregarFavoritos, quitarFavoritos, listaFavoritos } from './favoritos.js';
import { agregarEquipo, quitarVariosEquipo, listaEquipo } from './equipo.js';

// Convierte ids guardados en fichas ordenadas por número
function aFichas(ids) {
  return ids
    .map(buscarPorId)
    .filter(Boolean)
    .sort((a, b) => a.id - b.id);
}

// Llena el resumen de una tarjeta de sección: el texto del contador y los mini-sprites
function pintarResumen(selectorSeccion, pokemones, texto) {
  const detalle = document.querySelector(`${selectorSeccion} .seccion__detalle`);
  if (detalle) {
    detalle.textContent = texto;
  }

  const mini = document.querySelector(`${selectorSeccion} .mini-sprites`);
  if (mini) {
    const primeros = pokemones.slice(0, 3)
      .map((p) => `<li><img src="assets/${p.slug}.png" alt="" width="34" height="34"></li>`)
      .join('');
    const resto = pokemones.length > 3
      ? `<li class="mini-sprites__mas">+${pokemones.length - 3}</li>` : '';
    mini.innerHTML = primeros + resto;
  }
}

function pintarCapturados() {
  const capturados = aFichas(listaCapturados());

  // 1) Resumen de la tarjeta de sección: el número y los mini-sprites
  pintarResumen('.seccion--capturados', capturados, `${capturados.length} Pokémon en tu colección`);

  // 2) Grilla dentro del diálogo "Pokémon capturados"
  const grilla = document.querySelector('#modal-capturados .capturados');
  if (grilla) {
    if (capturados.length === 0) {
      grilla.innerHTML = '<li class="capturados__vacio">Todavía no capturaste ninguno. Entrá a la Pokédex y tocá “Capturar”.</li>';
    } else {
      grilla.innerHTML = capturados.map((p) => `
        <li class="captura">
          <input type="checkbox" class="captura__check" id="cap-${p.id}" value="${p.id}" aria-label="Seleccionar a ${p.nombre}">
          <label class="captura__cuerpo" for="cap-${p.id}">
            <span class="sprite-zona"><img src="assets/${p.slug}.png" alt="" width="96" height="96"></span>
            <span class="numero">${numeroPokedex(p.id)}</span>
            <span class="captura__nombre">${p.nombre}</span>
          </label>
        </li>`).join('');
    }
    const nota = document.querySelector('#modal-capturados .modal__nota');
    if (nota) nota.textContent = `${capturados.length} Pokémon capturados`;
  }
}

// Resumen de la tarjeta "Favoritos"
function pintarResumenFavoritos() {
  const favoritos = aFichas(listaFavoritos());
  pintarResumen('.seccion--favoritos', favoritos, `${favoritos.length} Pokémon marcados`);
}

// Resumen de la tarjeta "Equipo"
function pintarResumenEquipo() {
  const equipo = aFichas(listaEquipo());
  pintarResumen('.seccion--equipo', equipo, `${equipo.length} de 6 espacios ocupados`);
}

// Devuelve los ids (números) de los Pokémon con la casilla marcada en el modal de Capturados
function idsSeleccionados() {
  return [...document.querySelectorAll('#modal-capturados .captura__check:checked')]
    .map((casilla) => Number(casilla.value));
}

// true si hay selección y TODOS los seleccionados ya son favoritos
function seleccionEsFavorita() {
  const ids = idsSeleccionados();
  const favoritos = listaFavoritos();
  return ids.length > 0 && ids.every((id) => favoritos.includes(id));
}

// Pinta el botón según la selección: si ya son favoritos, cambia a estrella llena y "Quitar favorito"
function pintarBotonFavorito(boton) {
  const activo = seleccionEsFavorita();
  boton.classList.toggle('boton--favorito-activo', activo);
  const texto = boton.querySelector('.boton__texto');
  if (texto) texto.textContent = activo ? 'Quitar favorito' : 'Marcar favorito';
}

// Botón "Marcar favorito": funciona como interruptor sobre los Pokémon seleccionados.
//  - Si todos ya son favoritos, los quita (estrella vacía).
//  - Si no, los agrega (estrella llena).
function activarMarcarFavorito() {
  const boton = document.querySelector('#btn-marcar-favorito');
  if (!boton) return;
  pintarBotonFavorito(boton);

  boton.addEventListener('click', () => {
    const ids = idsSeleccionados();
    if (ids.length === 0) return;   // nada seleccionado: no hay nada que guardar
    if (seleccionEsFavorita()) {
      quitarFavoritos(ids);
    } else {
      agregarFavoritos(ids);
    }
    pintarBotonFavorito(boton);
    pintarResumenFavoritos();   // refresca el contador y los mini-sprites de la tarjeta
  });

  // Al marcar o desmarcar casillas, el botón se actualiza
  const grilla = document.querySelector('#modal-capturados .capturados');
  if (grilla) {
    grilla.addEventListener('change', () => pintarBotonFavorito(boton));
  }
}

// Botón "Marcar favorito": funciona como interruptor sobre los Pokémon seleccionados.
//  - Si todos ya son favoritos, los quita (estrella vacía).
//  - Si no, los agrega (estrella llena).
function activarMarcarEquipo() {
  const boton = document.querySelector('#btn-marcar-equipo');
  if (!boton) return;

  boton.addEventListener('click', () => {
    const ids = idsSeleccionados();
    if (ids.length === 0) return;   // nada seleccionado: no hay nada que guardar

    const cantidadAnterior = listaEquipo().length;
    const equipo = agregarEquipo(ids);

    if (equipo.length === 6 && cantidadAnterior + ids.length > 6) {
      alert('El equipo solo puede tener 6 Pokémon');
    }

    pintarResumenEquipo();
  });
}


pintarCapturados();
pintarResumenFavoritos();
pintarResumenEquipo();
activarMarcarFavorito();
activarMarcarEquipo();
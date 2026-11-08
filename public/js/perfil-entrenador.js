// =============================================================
//  perfil-entrenador.js  —  Muestra en el perfil los Pokémon
//  que la persona capturó desde la lista (leídos de localStorage).
//  Los diálogos (modales) se abren solos con command/commandfor;
//  este archivo solo llena el contenido de "Capturados".
// =============================================================
import { buscarPorId, numeroPokedex } from './datos.js';
import { listaCapturados } from './capturados.js';
import { agregarEquipo, quitarVariosEquipo, listaEquipo } from './equipo.js';
import { agregarFavoritos, quitarFavorito, quitarFavoritos, listaFavoritos } from './favoritos.js';

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

function nombreTipo(tipo) {
  if (tipo === 'electrico') return 'Eléctrico';
  return tipo.charAt(0).toUpperCase() + tipo.slice(1);
}

// Lista dentro del diálogo "Favoritos"
function pintarFavoritos() {
  const favoritos = aFichas(listaFavoritos());
  pintarResumenFavoritos();

  const subtitulo = document.querySelector('#modal-favoritos .modal__subtitulo');
  if (subtitulo) subtitulo.textContent = `${favoritos.length} Pokémon marcados como favoritos`;

  const lista = document.querySelector('#modal-favoritos .favoritos');
  if (!lista) return;

  if (favoritos.length === 0) {
    lista.innerHTML = '<li class="favoritos__vacio">Todavía no tenés favoritos. Abrí tus capturados y tocá “Marcar favorito”.</li>';
    return;
  }

  lista.innerHTML = favoritos.map((p) => {
    const tipos = p.tipos
      .map((t) => `<span class="tipo tipo--${t}">${nombreTipo(t)}</span>`)
      .join('');

    return `
      <li class="favorito">
        <span class="favorito__estrella"><svg class="icono icono--fav" aria-hidden="true" width="24" height="24"><use href="#i-star"/></svg></span>
        <div class="sprite-zona sprite-zona--chica"><img src="assets/${p.slug}.png" alt="" width="64" height="64"></div>
        <div class="favorito__datos">
          <h3>${p.nombre} <span class="numero">${numeroPokedex(p.id)}</span></h3>
          <span class="tipos">${tipos}</span>
        </div>
        <div class="favorito__acciones">
          <a class="boton boton--borde-azul boton--chico" href="detalle.html?id=${p.id}">Ver detalle<span class="solo-lectores"> de ${p.nombre}</span> <svg class="icono " aria-hidden="true" width="24" height="24"><use href="#i-arrow"/></svg></a>
          <button type="button" class="boton boton--borde-rojo boton--chico favorito__quitar" data-id="${p.id}">Quitar de favoritos<span class="solo-lectores">: ${p.nombre}</span></button>
        </div>
      </li>`;
  }).join('');
}

// Botones "Quitar de favoritos" del diálogo. Como la lista se vuelve a pintar,
// el evento se pone una sola vez en la lista y no en cada botón.
function activarQuitarFavorito() {
  const lista = document.querySelector('#modal-favoritos .favoritos');
  if (!lista) return;

  lista.addEventListener('click', (evento) => {
    const boton = evento.target.closest('.favorito__quitar');
    if (!boton) return;

    quitarFavorito(Number(boton.dataset.id));
    pintarFavoritos();

    const botonMarcar = document.querySelector('#btn-marcar-favorito');
    if (botonMarcar) pintarBotonFavorito(botonMarcar);
  });
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
    pintarFavoritos();   // refresca el contador, los mini-sprites y el diálogo de favoritos
  });

  // Al marcar o desmarcar casillas, el botón se actualiza
  const grilla = document.querySelector('#modal-capturados .capturados');
  if (grilla) {
    grilla.addEventListener('change', () => pintarBotonFavorito(boton));
  }
}

pintarCapturados();
pintarFavoritos();
activarMarcarFavorito();
activarQuitarFavorito();
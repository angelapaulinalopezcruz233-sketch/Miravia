// ==========================================
// DATOS DE ESTADOS · MIRAVIA
// Hospedaje, comida y lugares turísticos
// ==========================================

const DATOS_ESTADOS = {

  /* ---------- BASE DE TODOS LOS ESTADOS ---------- */

  aguascalientes: { nombre: "Aguascalientes", capital: "Aguascalientes", coords: [21.89, -102.29], descripcion: "Famosa por su Feria de San Marcos, la más grande de México, y sus aguas termales." },
  "baja-california": { nombre: "Baja California", capital: "Mexicali", coords: [30.84, -115.28], descripcion: "Tierra del vino mexicano en el Valle de Guadalupe y playas como Ensenada y Rosarito." },
  "baja-california-sur": { nombre: "Baja California Sur", capital: "La Paz", coords: [25.04, -111.66], descripcion: "Hogar de Los Cabos y el mar de Cortés, con playas y avistamientos de ballenas inolvidables." },
  campeche: { nombre: "Campeche", capital: "San Francisco de Campeche", coords: [19.83, -90.53], descripcion: "Ciudad amurallada colonial, Patrimonio de la Humanidad, y ruinas mayas como Edzná." },
  chiapas: { nombre: "Chiapas", capital: "Tuxtla Gutiérrez", coords: [16.75, -93.12], descripcion: "Cañón del Sumidero, San Cristóbal de las Casas, Cascadas de Agua Azul y las ruinas de Palenque." },
  oaxaca: { nombre: "Oaxaca", capital: "Oaxaca de Juárez", coords: [17.07, -96.72], descripcion: "Monte Albán, Hierve el Agua, mole, tlayudas y las playas de Huatulco y Puerto Escondido." },
  chihuahua: { nombre: "Chihuahua", capital: "Chihuahua", coords: [28.63, -106.07], descripcion: "Las Barrancas del Cobre, más grandes que el Gran Cañón, y el histórico Chepe Express." },
  "ciudad-de-mexico": { nombre: "Ciudad de México", capital: "Ciudad de México", coords: [19.43, -99.13], descripcion: "Museos, el Zócalo, Teotihuacán cerca y una de las mejores gastronomías del mundo." },
  coahuila: { nombre: "Coahuila", capital: "Saltillo", coords: [25.43, -100.99], descripcion: "Desierto con zona del silencio, huellas de dinosaurios y viñedos del norte." },
  colima: { nombre: "Colima", capital: "Colima", coords: [19.24, -103.72], descripcion: "El volcán de fuego, playas tranquilas en Manzanillo y tumbas de tiro en el Cerro de la Campana." },
  durango: { nombre: "Durango", capital: "Victoria de Durango", coords: [24.02, -104.65], descripcion: "Pueblos del mexicano, Sierra Madre Occidental y sets de cine del viejo oeste." },
  guerrero: { nombre: "Guerrero", capital: "Chilpancingo", coords: [17.55, -99.50], descripcion: "Acapulco y su bahía, Taxco la ciudad plateada y grutas impresionantes." },
  hidalgo: { nombre: "Hidalgo", capital: "Pachuca", coords: [20.10, -98.76], descripcion: "Barranca de Metztitlán, prismas basálticos de Santa María Regla y las luces de Pachuca." },
  "estado-de-mexico": { nombre: "Estado de México", capital: "Toluca", coords: [19.29, -99.65], descripcion: "Pirámides de Teotihuacán, Nevado de Toluca y el Cosmovitral de Toluca." },
  michoacan: { nombre: "Michoacán", capital: "Morelia", coords: [19.70, -101.19], descripcion: "Morelia colonial, la mariposa monarca, Pátzcuaro y su noche de muertos única." },
  "nuevo-leon": { nombre: "Nuevo León", capital: "Monterrey", coords: [25.67, -100.31], descripcion: "Monterrey con su Cerro de la Silla, Grutas de García, la Cascada Cola de Caballo y la ruta del queso." },
  morelos: { nombre: "Morelos", capital: "Cuernavaca", coords: [18.68, -99.10], descripcion: "La ciudad de la eterna primavera, Tepoztlán místico y las lagunas de Zempoala." },
  nayarit: { nombre: "Nayarit", capital: "Tepic", coords: [21.75, -104.85], descripcion: "Riviera Nayarit, la isla de Mexcaltitán y olas de clase mundial en San Blas." },
  "san-luis-potosi": { nombre: "San Luis Potosí", capital: "San Luis Potosí", coords: [22.16, -100.99], descripcion: "La Huasteca Potosina con sus cascadas turquesa y el mágico Real de Catorce." },
  queretaro: { nombre: "Querétaro", capital: "Querétaro", coords: [20.59, -100.39], descripcion: "Centro histórico Patrimonio de la Humanidad, Peña de Bernal y la ruta del vino y queso." },
  sinaloa: { nombre: "Sinaloa", capital: "Culiacán", coords: [24.81, -107.39], descripcion: "Mazatlán y su malecón, playas doradas y mariscos de primera." },
  sonora: { nombre: "Sonora", capital: "Hermosillo", coords: [29.07, -110.96], descripcion: "Desierto de Altar, San Carlos y sus playas del mar de Cortés, tierra de la carne asada." },
  tabasco: { nombre: "Tabasco", capital: "Villahermosa", coords: [17.99, -92.93], descripcion: "Parque de la Venta con cabezas olmecas y la majestuosa selva del Usumacinta." },
  tamaulipas: { nombre: "Tamaulipas", capital: "Ciudad Victoria", coords: [23.74, -99.14], descripcion: "El Cielo biosfera estrellada, playas de Tampico y cuevas impresionantes." },
  tlaxcala: { nombre: "Tlaxcala", capital: "Tlaxcala", coords: [19.32, -98.24], descripcion: "El estado más pequeño: murales, pirámides de Cacaxtla y pulque tradicional." },
  veracruz: { nombre: "Veracruz", capital: "Xalapa", coords: [19.17, -96.13], descripcion: "Cuna del son jarocho, el Tajín, ríos de rápidos y el café de Coatepec." },
  zacatecas: { nombre: "Zacatecas", capital: "Zacatecas", coords: [22.77, -102.58], descripcion: "Mina El Edén, cerro de la Bufa y una de las ciudades coloniales más bellas." },

  /* ---------- ESTADOS CON DATOS COMPLETOS ---------- */

  jalisco: {
    nombre: "Jalisco", capital: "Guadalajara", coords: [20.66, -103.35],
    descripcion: "Cuna del tequila y el mariachi, Puerto Vallarta y el hermoso Lago de Chapala.",
    hoteles: [
      { nombre: "Hotel Demetria", tipo: "HOTEL", precio: "$1,850", calificacion: "4.6", ubicacion: "Guadalajara, Jalisco", descripcion: "Hotel boutique con diseño contemporáneo cerca de la Avenida Chapultepec." },
      { nombre: "Casa Karma Boutique", tipo: "BOUTIQUE", precio: "$2,400", calificacion: "4.8", ubicacion: "Puerto Vallarta, Jalisco", descripcion: "Vistas a la bahía de Banderas, alberca infinita y desayuno incluido." }
    ],
    restaurantes: [
      { nombre: "La Chata de Guadalajara", tipo: "MEXICANA", precio: "$280", calificacion: "4.7", ubicacion: "Centro Histórico, Guadalajara", descripcion: "Tortas ahogadas, pozole y cocina tapatía de toda la vida." },
      { nombre: "La Tequila Cocina de Autor", tipo: "AUTOR", precio: "$650", calificacion: "4.6", ubicacion: "Guadalajara, Jalisco", descripcion: "Alta cocina jalisciense con maridaje de tequilas artesanales." }
    ],
    lugares: [
      { nombre: "Centro Histórico de Guadalajara", descripcion: "Catedral, Hospicio Cabañas con murales de Orozco y Plaza de los Mariachis." },
      { nombre: "Tequila, Jalisco", descripcion: "Pueblo Mágico donde nace el tequila: haciendas, destilerías y campos agaveros." },
      { nombre: "Malecón de Puerto Vallarta", descripcion: "Playas, arte callejero y atardeceres frente al mar de Cortés." }
    ]
  },

  "quintana-roo": {
    nombre: "Quintana Roo", capital: "Chetumal", coords: [18.50, -88.30],
    descripcion: "Cancún, Tulum frente al mar, cenotes y la gran barrera maya de coral.",
    hoteles: [
      { nombre: "Hotel NYX Cancún", tipo: "RESORT", precio: "$3,200", calificacion: "4.7", ubicacion: "Zona Hotelera, Cancún", descripcion: "Frente al mar Caribe con alberca infinita y club de playa." },
      { nombre: "Cabañas Tulum Beach", tipo: "CABAÑA", precio: "$1,500", calificacion: "4.5", ubicacion: "Tulum, Quintana Roo", descripcion: "Cabañas ecológicas sobre la arena con acceso directo al mar." }
    ],
    restaurantes: [
      { nombre: "La Habichuela", tipo: "MARISCOS", precio: "$480", calificacion: "4.8", ubicacion: "Centro, Cancún", descripcion: "Mariscos y cocina caribeña en un jardín mágico desde 1977." },
      { nombre: "Restaurante Arca", tipo: "AUTOR", precio: "$700", calificacion: "4.7", ubicacion: "Tulum, Quintana Roo", descripcion: "Cocina de autor con fuego, productos locales y ambiente selvático." }
    ],
    lugares: [
      { nombre: "Zona Arqueológica de Tulum", descripcion: "Ruinas mayas acantiladas frente al mar Caribe, de las vistas más fotografiadas de México." },
      { nombre: "Cenote Dos Ojos", descripcion: "Cenote de agua cristalina ideal para snorkel y buceo en caverna." },
      { nombre: "Isla Mujeres", descripcion: "Playas de arena suave, el Parque Garrafón y travesías en barco desde Cancún." }
    ]
  },

  guanajuato: {
    nombre: "Guanajuato", capital: "Guanajuato", coords: [21.02, -101.26],
    descripcion: "Callejones mágicos, las momias de Guanajuato, San Miguel de Allende y fiestas coloridas.",
    hoteles: [
      { nombre: "Hotel Villa María Cristina", tipo: "BOUTIQUE", precio: "$2,100", calificacion: "4.7", ubicacion: "Guanajuato Capital", descripcion: "Hacienda del siglo XIX transformada en hotel boutique con patio colonial." },
      { nombre: "Casa de Sierra Nevada", tipo: "BOUTIQUE", precio: "$3,500", calificacion: "4.8", ubicacion: "San Miguel de Allende", descripcion: "Mansión colonial con spa, restaurant de autor y rooftop con vistas." }
    ],
    restaurantes: [
      { nombre: "La Trinidad", tipo: "MEXICANA", precio: "$350", calificacion: "4.6", ubicacion: "Guanajuato Capital", descripcion: "Cocina guanajuatense contemporánea en una antigua casona minera." },
      { nombre: "Restaurante Don Tage", tipo: "INTERNACIONAL", precio: "$420", calificacion: "4.5", ubicacion: "San Miguel de Allende", descripcion: "Terraza con vista al jardín y cortes a la parrilla." }
    ],
    lugares: [
      { nombre: "Callejón del Beso", descripcion: "El callejón más famoso de México, con balcones a 68 cm de distancia." },
      { nombre: "Museo de las Momias", descripcion: "Una de las exposiciones más singulares del mundo, ícono de Guanajuato." },
      { nombre: "Parroquia de San Miguel Arcángel", descripcion: "Ícono gótico de San Miguel de Allende en el corazón del centro histórico." }
    ]
  },

  yucatan: {
    nombre: "Yucatán", capital: "Mérida", coords: [20.97, -89.62],
    descripcion: "Chichén Itzá, cenotes cristalinos, Mérida blanca y la ruta puuc.",
    hoteles: [
      { nombre: "Hotel Casa Azul", tipo: "BOUTIQUE", precio: "$1,700", calificacion: "4.6", ubicacion: "Centro, Mérida", descripcion: "Casona yucateca restaurada a pasos de la Plaza Grande." },
      { nombre: "Hacienda Uayamón", tipo: "HACIENDA", precio: "$2,900", calificacion: "4.8", ubicacion: "Campeche (ruta puuc)", descripcion: "Antigua hacienda henequenera con suites y chapoteadero." }
    ],
    restaurantes: [
      { nombre: "La Chaya Maya", tipo: "YUCATECA", precio: "$260", calificacion: "4.7", ubicacion: "Mérida, Yucatán", descripcion: "Cochinita pibil, papadzules y sopa de lima auténticos." },
      { nombre: "Ku'uk", tipo: "AUTOR", precio: "$850", calificacion: "4.8", ubicacion: "Mérida, Yucatán", descripcion: "Alta cocina maya con técnicas modernas y maíz como protagonista." }
    ],
    lugares: [
      { nombre: "Chichén Itzá", descripcion: "Una de las nuevas 7 maravillas del mundo: el Templo de Kukulkán y el cenote sagrado." },
      { nombre: "Paseo de Montejo", descripcion: "El paseo más elegante de Mérida, con mansiones y museos." },
      { nombre: "Cenote Ik Kil", descripcion: "Cenote abierto rodeado de selva, a minutos de Chichén Itzá." }
    ]
  },

  puebla: {
    nombre: "Puebla", capital: "Puebla", coords: [19.04, -98.20],
    descripcion: "Talavera, mole poblano, Cholula con su pirámide y el hermoso centro histórico.",
    hoteles: [
      { nombre: "Hotel Cartesiano", tipo: "BOUTIQUE", precio: "$2,300", calificacion: "4.7", ubicacion: "Centro Histórico, Puebla", descripcion: "Antigua fábrica de cerámica convertida en hotel de lujo." },
      { nombre: "La Purificadora", tipo: "BOUTIQUE", precio: "$1,950", calificacion: "4.5", ubicacion: "Centro, Puebla", descripcion: "Hotel de diseño en un edificio industrial patrimonial." }
    ],
    restaurantes: [
      { nombre: "El Mural de los Poblanos", tipo: "POBLANA", precio: "$380", calificacion: "4.7", ubicacion: "Centro Histórico, Puebla", descripcion: "Mole poblano, chiles en nogada y mezcales de la sierra." },
      { nombre: "La Casa del Mendrugo", tipo: "AUTOR", precio: "$620", calificacion: "4.8", ubicacion: "Centro, Puebla", descripcion: "Cocina novohispana en una casona del siglo XVII." }
    ],
    lugares: [
      { nombre: "Gran Pirámide de Cholula", descripcion: "La pirámide más grande del mundo por volumen, con la iglesia de los Remedios arriba." },
      { nombre: "Catedral de Puebla", descripcion: "Una de las catedrales más imponentes de México en el zócalo poblano." },
      { nombre: "Callejón de los Sapos", descripcion: "Barrio de antigüedades, cafés y leyendas en el centro histórico." }
    ]
  },

  "ciudad-de-mexico": {
    nombre: "Ciudad de México", capital: "Ciudad de México", coords: [19.43, -99.13],
    descripcion: "Museos, el Zócalo, Teotihuacán cerca y una de las mejores gastronomías del mundo.",
    hoteles: [
      { nombre: "Hotel Zócalo Central", tipo: "HOTEL", precio: "$1,900", calificacion: "4.6", ubicacion: "Zócalo, CDMX", descripcion: "Vistas frontales a la Catedral y al Zócalo desde el rooftop." },
      { nombre: "Las Alcobas", tipo: "BOUTIQUE", precio: "$3,800", calificacion: "4.8", ubicacion: "Polanco, CDMX", descripcion: "Hotel de lujo sobre la avenida más elegante de Polanco." }
    ],
    restaurantes: [
      { nombre: "El Cardenal", tipo: "MEXICANA", precio: "$450", calificacion: "4.8", ubicacion: "Centro Histórico, CDMX", descripcion: "Desayunos legendarios: nata, mole y chocolate a la mexicana." },
      { nombre: "Contramar", tipo: "MARISCOS", precio: "$700", calificacion: "4.8", ubicacion: "Roma Norte, CDMX", descripcion: "El restaurante de mariscos más celebrado de la ciudad." }
    ],
    lugares: [
      { nombre: "Museo Nacional de Antropología", descripcion: "El museo más importante de México: la Piedra del Sol y salas mayas y mexicas." },
      { nombre: "Teotihuacán", descripcion: "Pirámides del Sol y de la Luna a solo una hora de la ciudad." },
      { nombre: "Xochimilco", descripcion: "Trajineras por los canales aztecas, patrimonio de la humanidad." }
    ]
  },

  /* ---------- PLANTILLA PARA LOS DEMÁS ESTADOS ---------- */

  plantilla: function (valor) {
    const base = this[valor];
    if (!base || !base.nombre) return null;
    const capital = base.capital;
    const atracciones = base.descripcion.split(",").map((parte) => parte.replace(/\sy\s$|\.$/g, "").trim()).filter(Boolean);
    return Object.assign({}, base, {
      hoteles: [
        { nombre: `Hotel Central ${capital}`, tipo: "HOTEL", precio: "$950", calificacion: "4.3", ubicacion: `Centro, ${capital}`, descripcion: `Hospedaje cómodo y bien ubicado para conocer ${base.nombre}.` },
        { nombre: `Cabañas y Suites ${base.nombre}`, tipo: "CABAÑA", precio: "$800", calificacion: "4.5", ubicacion: base.nombre, descripcion: `Ambiente tranquilo rodeado de naturaleza, ideal para descansar en ${base.nombre}.` }
      ],
      restaurantes: [
        { nombre: `Restaurante La Capital`, tipo: "MEXICANA", precio: "$250", calificacion: "4.4", ubicacion: capital, descripcion: `Comida mexicana tradicional con lo mejor de la cocina de ${base.nombre}.` },
        { nombre: `Mercado Municipal de ${capital}`, tipo: "MERCADO", precio: "$120", calificacion: "4.2", ubicacion: capital, descripcion: "Antojitos locales, frutas de temporada y sabor auténtico." }
      ],
      lugares: atracciones.slice(0, 3).map((texto) => ({ nombre: texto.charAt(0).toUpperCase() + texto.slice(1), descripcion: `Un imperdible de ${base.nombre} que no te puedes perder.` }))
    });
  },

  obtener: function (valor) {
    return (this[valor] && this[valor].hoteles) ? this[valor] : this.plantilla(valor);
  }

};

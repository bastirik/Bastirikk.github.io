$('.caro').slick({
  arrows: true,
  centerMode: true,
  centerPadding: '50px',
  slidesToShow: 3,
  focusOnSelect: true,
  prevArrow: '<i style="position: absolute; top: 50%; transform: translate(0, -50%); left: -35px; cursor: pointer;" class="fas fa-chevron-left fa-2x"></i>',
  nextArrow: '<i style="position: absolute; top: 50%; transform: translate(0, -50%); right: -35px; cursor: pointer;" class="fas fa-chevron-right fa-2x"></i>',
  responsive: [{
      breakpoint: 768,
      settings: {
        arrows: false,
        centerMode: true,
        centerPadding: '30px',
        slidesToShow: 1
      }
    },
  ]
});
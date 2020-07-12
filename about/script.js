$('.caro').slick({
  arrows: true,
  centerMode: true,
  centerPadding: '50px',
  slidesToShow: 3,
  focusOnSelect: true,
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
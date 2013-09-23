require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Chord, ChordDiagram, Chords, Instruments, Layout, Scale, Scales, app, chordFingerings, _ref;

ChordDiagram = require('./chord_diagram');

Layout = require('./layout');

Instruments = require('./instruments');

chordFingerings = require('./fingerings').chordFingerings;

_ref = require('./theory'), Chord = _ref.Chord, Chords = _ref.Chords, Scale = _ref.Scale, Scales = _ref.Scales;

angular.element(document).ready(function() {
  return angular.bootstrap(document, ['FretboardApp']);
});

_.mixin({
  reverse: function(array) {
    return [].concat(array).reverse();
  }
});

app = angular.module('FretboardApp', ['ngAnimate', 'ngRoute', 'ngSanitize']);

app.config(function($locationProvider, $routeProvider) {
  return $routeProvider.when('/', {
    controller: 'ChordTableCtrl',
    templateUrl: 'templates/chord-table.html'
  }).when('/chord/:chordName', {
    controller: 'ChordDetailsCtrl',
    templateUrl: 'templates/chord-details.html'
  }).otherwise({
    redirectTo: '/'
  });
});

app.controller('ChordTableCtrl', function($scope) {
  $scope.tonics = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  return $scope.getScaleChords = (function() {
    var cache;
    cache = {};
    return function(scaleName, sevenths) {
      var _name;
      return cache[_name = [scaleName, sevenths]] || (cache[_name] = Scale.find(scaleName).chords({
        sevenths: sevenths
      }));
    };
  })();
});

app.controller('ChordDetailsCtrl', function($scope, $routeParams) {
  var badge, chordName, fingering, labels, name, sortKeys, _i, _len, _ref1, _ref2;
  chordName = $routeParams.chordName.replace('&#9839;', '#');
  $scope.chord = Chord.find(chordName);
  $scope.instrument = Instruments.Default;
  $scope.fingerings = chordFingerings($scope.chord, $scope.instrument, {
    allPositions: true
  });
  _ref1 = $scope.fingerings;
  for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
    fingering = _ref1[_i];
    labels = [];
    sortKeys = {};
    _ref2 = fingering.properties;
    for (name in _ref2) {
      badge = _ref2[name];
      if (badge === true) {
        badge = null;
      }
      labels.push({
        name: name,
        badge: badge
      });
      sortKeys[name] = badge;
    }
    fingering.labels = labels.sort();
    fingering.sortKeys = sortKeys;
  }
  $scope.keys = _.chain($scope.fingerings).pluck('properties').map(_.keys).flatten().uniq().value();
  $scope.sortKey = '';
  return $scope.orderBy = function(sortKey) {
    var fingerings, _j, _len1, _results;
    $scope.sortKey = sortKey;
    $('#voicings').isotope({
      sortBy: sortKey
    });
    fingerings = $scope.fingerings;
    _results = [];
    for (_j = 0, _len1 = fingerings.length; _j < _len1; _j++) {
      fingering = fingerings[_j];
      labels = fingering.labels.filter(function(label) {
        return label.name === sortKey;
      });
      if (labels.length) {
        _results.push(fingering.labels = labels.concat(_.difference(fingering.labels, labels)));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };
});

app.directive('isotopeContainer', function() {
  return {
    restrict: 'CAE',
    link: {
      post: function(scope, element, attrs) {
        var sortData;
        sortData = {};
        scope.keys.map(function(key) {
          return sortData[key] = function($elem) {
            return angular.element($elem).scope().fingering.sortKeys[key] || 0;
          };
        });
        return $(element).isotope({
          animationEngineString: 'css',
          itemSelector: '[isotope-item]',
          layoutMode: 'fitRows',
          getSortData: sortData
        });
      }
    }
  };
});

app.directive('isotopeItem', function($timeout) {
  return {
    restrict: 'AE',
    link: function(scope, element, attrs) {
      var $element;
      if (!scope.$last) {
        return;
      }
      $element = $(element);
      return element.ready(function() {
        var $container;
        $container = $element.parent('.isotope');
        return $container.isotope('reloadItems').isotope({
          sortBy: 'barres'
        }).css('visibility', 'inherit');
      });
    }
  };
});

app.directive('chord', function() {
  return {
    restrict: 'CE',
    replace: true,
    template: function() {
      var dimensions, instrument;
      instrument = Instruments.Default;
      dimensions = {
        width: ChordDiagram.width(instrument),
        height: ChordDiagram.height(instrument)
      };
      return "<div><span class='fretNumber' ng:show='topFretNumber'>{{topFretNumber}}</span>" + ("<canvas width='" + dimensions.width + "' height='" + dimensions.height + "'/></div>");
    },
    scope: {
      chord: '=',
      fingering: '=?'
    },
    link: function(scope, element, attrs) {
      var canvas, ctx, instrument;
      canvas = element[0].querySelector('canvas');
      ctx = canvas.getContext('2d');
      instrument = Instruments.Default;
      return (function() {
        var chord, fingering, fingerings, topFret;
        chord = scope.chord, fingering = scope.fingering;
        fingerings = chordFingerings(chord, instrument);
        fingering || (fingering = fingerings[0]);
        if (!fingering) {
          return;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        topFret = ChordDiagram.draw(ctx, instrument, fingering.positions, {
          barres: fingering.barres
        }).topFret;
        if (topFret > 0) {
          return scope.topFretNumber = topFret;
        }
      })();
    }
  };
});

app.filter('raiseAccidentals', function() {
  return function(name) {
    return name.replace(/([♯♭])/, '<sup>$1</sup>');
  };
});


},{"./chord_diagram":"EHWjuh","./fingerings":"/X1WgR","./instruments":"B8u3u9","./layout":"B83s2m","./theory":"80u6C5"}],"QgR0mD":[function(require,module,exports){



},{}],"EHWjuh":[function(require,module,exports){
var DefaultStyle, FretCount, FretNumbers, Layout, SmallStyle, computeChordDiagramDimensions, drawChordBlock, drawChordDiagram, drawChordDiagramFrets, drawChordDiagramStrings, hsv2css, _, _ref,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

_ = require('underscore');

_ref = require('./instruments'), FretCount = _ref.FretCount, FretNumbers = _ref.FretNumbers;

Layout = require('./layout');

hsv2css = require('./utils').hsv2css;

SmallStyle = {
  h_gutter: 5,
  v_gutter: 5,
  string_spacing: 6,
  fret_height: 8,
  above_fretboard: 8,
  note_radius: 1,
  closed_string_fontsize: 4,
  chord_degree_colors: ['red', 'blue', 'green', 'orange'],
  intervalClass_colors: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(function(n) {
    return hsv2css({
      h: n * 360 / 12,
      s: 1,
      v: 1
    });
  })
};

DefaultStyle = _.extend({}, SmallStyle, {
  string_spacing: 12,
  fret_height: 16,
  note_radius: 3,
  closed_string_fontsize: 8
});

computeChordDiagramDimensions = function(instrument, style) {
  if (style == null) {
    style = DefaultStyle;
  }
  return {
    width: 2 * style.h_gutter + (instrument.strings - 1) * style.string_spacing,
    height: 2 * style.v_gutter + (style.fret_height + 2) * FretCount
  };
};

drawChordDiagramStrings = function(ctx, instrument, options) {
  var string, style, x, _i, _len, _ref1, _results;
  if (options == null) {
    options = {};
  }
  style = DefaultStyle;
  _ref1 = instrument.stringNumbers;
  _results = [];
  for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
    string = _ref1[_i];
    x = string * style.string_spacing + style.h_gutter;
    ctx.beginPath();
    ctx.moveTo(x, style.v_gutter + style.above_fretboard);
    ctx.lineTo(x, style.v_gutter + style.above_fretboard + FretCount * style.fret_height);
    ctx.strokeStyle = (options.dimStrings && __indexOf.call(options.dimStrings, string) >= 0 ? 'rgba(0,0,0,0.2)' : 'black');
    _results.push(ctx.stroke());
  }
  return _results;
};

drawChordDiagramFrets = function(ctx, instrument, _arg) {
  var drawNut, fret, style, y, _i, _len, _results;
  drawNut = (_arg != null ? _arg : {
    drawNut: true
  }).drawNut;
  style = DefaultStyle;
  ctx.strokeStyle = 'black';
  _results = [];
  for (_i = 0, _len = FretNumbers.length; _i < _len; _i++) {
    fret = FretNumbers[_i];
    y = style.v_gutter + style.above_fretboard + fret * style.fret_height;
    ctx.beginPath();
    ctx.moveTo(style.v_gutter - 0.5, y);
    ctx.lineTo(style.v_gutter + 0.5 + (instrument.strings - 1) * style.string_spacing, y);
    if (fret === 0 && drawNut) {
      ctx.lineWidth = 3;
    }
    ctx.stroke();
    _results.push(ctx.lineWidth = 1);
  }
  return _results;
};

drawChordDiagram = function(ctx, instrument, positions, options) {
  var barres, defaults, drawBarres, drawClosedStrings, drawFingerPosition, drawFingerPositions, drawNut, dy, fingerCoordinates, fret, frets, highestFret, lowestFret, string, style, topFret, usedStrings;
  if (options == null) {
    options = {};
  }
  defaults = {
    drawClosedStrings: true,
    drawNut: true,
    dy: 0,
    style: DefaultStyle
  };
  options = _.extend(defaults, options);
  barres = options.barres, dy = options.dy, drawClosedStrings = options.drawClosedStrings, drawNut = options.drawNut, style = options.style;
  topFret = 0;
  frets = (function() {
    var _i, _len, _results;
    _results = [];
    for (_i = 0, _len = positions.length; _i < _len; _i++) {
      fret = positions[_i].fret;
      if (fret !== 0) {
        _results.push(fret);
      }
    }
    return _results;
  })();
  lowestFret = Math.min.apply(Math, frets);
  highestFret = Math.max.apply(Math, frets);
  if (highestFret > 4) {
    topFret = lowestFret - 1;
    drawNut = false;
  }
  if (options.dimUnusedStrings) {
    usedStrings = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = positions.length; _i < _len; _i++) {
        string = positions[_i].string;
        _results.push(string);
      }
      return _results;
    })();
    options.dimStrings = (function() {
      var _i, _len, _ref1, _results;
      _ref1 = instrument.stringNumbers;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        string = _ref1[_i];
        if (__indexOf.call(usedStrings, string) < 0) {
          _results.push(string);
        }
      }
      return _results;
    })();
  }
  fingerCoordinates = function(_arg) {
    var fret, string;
    string = _arg.string, fret = _arg.fret;
    if (fret > 0) {
      fret -= topFret;
    }
    return {
      x: style.h_gutter + string * style.string_spacing,
      y: style.v_gutter + style.above_fretboard + (fret - 0.5) * style.fret_height + dy
    };
  };
  drawFingerPosition = function(position, options) {
    var color, isRoot, x, y, _ref1;
    if (options == null) {
      options = {};
    }
    isRoot = options.isRoot, color = options.color;
    _ref1 = fingerCoordinates(position), x = _ref1.x, y = _ref1.y;
    ctx.fillStyle = color || (isRoot ? 'red' : 'white');
    ctx.strokeStyle = color || (isRoot ? 'red' : 'black');
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (isRoot && position.fret) {
      (function(r) {
        return ctx.rect(x - r, y - r, 2 * r, 2 * r);
      })(style.note_radius);
    } else {
      ctx.arc(x, y, style.note_radius, 0, Math.PI * 2, false);
    }
    if (position.fret > 0 || isRoot) {
      ctx.fill();
    }
    return ctx.stroke();
  };
  drawBarres = function() {
    var eccentricity, firstString, stringCount, w, x1, x2, y, _fn, _fn1, _i, _len, _ref1, _ref2, _results;
    ctx.fillStyle = 'black';
    _fn = function() {
      ctx.save();
      ctx.scale(w, eccentricity);
      ctx.arc(0, 0, style.string_spacing / 2 / eccentricity, Math.PI, 0, false);
      return ctx.restore();
    };
    _fn1 = function() {
      ctx.save();
      ctx.scale(w, 14);
      ctx.arc(0, 0, style.string_spacing / 2 / eccentricity, 0, Math.PI, true);
      return ctx.restore();
    };
    _results = [];
    for (_i = 0, _len = barres.length; _i < _len; _i++) {
      _ref1 = barres[_i], fret = _ref1.fret, firstString = _ref1.firstString, stringCount = _ref1.stringCount;
      _ref2 = fingerCoordinates({
        string: firstString,
        fret: fret
      }), x1 = _ref2.x, y = _ref2.y;
      x2 = fingerCoordinates({
        string: firstString + stringCount - 1,
        fret: fret
      }).x;
      w = x2 - x1;
      ctx.save();
      ctx.translate((x1 + x2) / 2, y - style.fret_height * .25);
      ctx.beginPath();
      eccentricity = 10;
      _fn();
      _fn1();
      ctx.fill();
      _results.push(ctx.restore());
    }
    return _results;
  };
  drawFingerPositions = function() {
    var default_options, position, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = positions.length; _i < _len; _i++) {
      position = positions[_i];
      default_options = {
        color: style.intervalClass_colors[position.intervalClass],
        isRoot: position.intervalClass === 0
      };
      _results.push(drawFingerPosition(position, _.extend(default_options, position)));
    }
    return _results;
  };
  drawClosedStrings = function() {
    var closed_strings, fretted_strings, position, r, x, y, _i, _j, _len, _len1, _ref1, _results;
    fretted_strings = [];
    for (_i = 0, _len = positions.length; _i < _len; _i++) {
      position = positions[_i];
      fretted_strings[position.string] = true;
    }
    closed_strings = (function() {
      var _j, _len1, _ref1, _results;
      _ref1 = instrument.stringNumbers;
      _results = [];
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        string = _ref1[_j];
        if (!fretted_strings[string]) {
          _results.push(string);
        }
      }
      return _results;
    })();
    r = style.note_radius;
    ctx.fillStyle = 'black';
    _results = [];
    for (_j = 0, _len1 = closed_strings.length; _j < _len1; _j++) {
      string = closed_strings[_j];
      _ref1 = fingerCoordinates({
        string: string,
        fret: 0
      }), x = _ref1.x, y = _ref1.y;
      ctx.strokeStyle = 'black';
      ctx.beginPath();
      ctx.moveTo(x - r, y - r);
      ctx.lineTo(x + r, y + r);
      ctx.moveTo(x - r, y + r);
      ctx.lineTo(x + r, y - r);
      _results.push(ctx.stroke());
    }
    return _results;
  };
  drawChordDiagramStrings(ctx, instrument, options);
  drawChordDiagramFrets(ctx, instrument, {
    drawNut: drawNut
  });
  if (barres) {
    drawBarres();
  }
  if (positions) {
    drawFingerPositions();
  }
  if (positions && options.drawClosedStrings) {
    drawClosedStrings();
  }
  return {
    topFret: topFret
  };
};

drawChordBlock = function(instrument, positions, options) {
  var dimensions;
  dimensions = computeChordDiagramDimensions(instrument);
  return Layout.block({
    width: dimensions.width,
    height: dimensions.height,
    draw: function() {
      return Layout.withGraphicsContext(function(ctx) {
        ctx.translate(0, -dimensions.height);
        return drawChordDiagram(ctx, instrument, positions, options);
      });
    }
  });
};

module.exports = {
  defaultStyle: DefaultStyle,
  width: function(instrument) {
    return computeChordDiagramDimensions(instrument).width;
  },
  height: function(instrument) {
    return computeChordDiagramDimensions(instrument).height;
  },
  draw: drawChordDiagram,
  block: drawChordBlock
};


},{"./instruments":"B8u3u9","./layout":"B83s2m","./utils":"+Nu4mz","underscore":24}],"/X1WgR":[function(require,module,exports){
var Fingering, FretNumbers, Instruments, bestFingeringFor, chordFingerings, collectBarreSets, computeBarreCandidateStrings, findBarres, fingerPositionsOnChord, fretboardPositionsEach, getPitchClassName, intervalClassDifference, pitchNumberForPosition, powerset, util, _, _ref,
  __slice = [].slice,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

util = require('util');

_ = require('underscore');

_ref = require('./theory'), getPitchClassName = _ref.getPitchClassName, intervalClassDifference = _ref.intervalClassDifference;

Instruments = require('./instruments');

FretNumbers = Instruments.FretNumbers, fretboardPositionsEach = Instruments.fretboardPositionsEach, pitchNumberForPosition = Instruments.pitchNumberForPosition;

require('./utils');

Fingering = (function() {
  function Fingering(_arg) {
    this.positions = _arg.positions, this.chord = _arg.chord, this.barres = _arg.barres, this.instrument = _arg.instrument;
    this.positions.sort(function(a, b) {
      return a.string - b.string;
    });
    this.properties = {};
  }

  Fingering.cached_getter('fretstring', function() {
    var fret, fretArray, s, string, x, _i, _len, _ref1, _ref2;
    fretArray = (function() {
      var _i, _len, _ref1, _results;
      _ref1 = this.instrument.stringNumbers;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        s = _ref1[_i];
        _results.push(-1);
      }
      return _results;
    }).call(this);
    _ref1 = this.positions;
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      _ref2 = _ref1[_i], string = _ref2.string, fret = _ref2.fret;
      fretArray[string] = fret;
    }
    return ((function() {
      var _j, _len1, _results;
      _results = [];
      for (_j = 0, _len1 = fretArray.length; _j < _len1; _j++) {
        x = fretArray[_j];
        _results.push(x >= 0 ? x : 'x');
      }
      return _results;
    })()).join('');
  });

  Fingering.cached_getter('chordName', function() {
    var name;
    name = this.chord.name;
    if (this.inversion > 0) {
      name += " / " + (getPitchClassName(this.instrument.pitchAt(this.positions[0])));
    }
    return name;
  });

  Fingering.cached_getter('inversion', function() {
    return this.chord.pitchClasses.indexOf(intervalClassDifference(this.chord.rootPitch, this.instrument.pitchAt(this.positions[0])));
  });

  Fingering.cached_getter('inversionLetter', function() {
    if (!(this.inversion > 0)) {
      return;
    }
    return String.fromCharCode(96 + this.inversion);
  });

  return Fingering;

})();

powerset = function(array) {
  var tail, x, xs, ys;
  if (!array.length) {
    return [[]];
  }
  x = array[0], xs = 2 <= array.length ? __slice.call(array, 1) : [];
  tail = powerset(xs);
  return tail.concat((function() {
    var _i, _len, _results;
    _results = [];
    for (_i = 0, _len = tail.length; _i < _len; _i++) {
      ys = tail[_i];
      _results.push([x].concat(ys));
    }
    return _results;
  })());
};

computeBarreCandidateStrings = function(instrument, fretArray) {
  var codeStrings, fret, referenceFret, _i, _len;
  codeStrings = [];
  for (_i = 0, _len = fretArray.length; _i < _len; _i++) {
    referenceFret = fretArray[_i];
    if (typeof referenceFret !== 'number') {
      continue;
    }
    codeStrings[referenceFret] || (codeStrings[referenceFret] = ((function() {
      var _j, _len1, _results;
      _results = [];
      for (_j = 0, _len1 = fretArray.length; _j < _len1; _j++) {
        fret = fretArray[_j];
        if (fret < referenceFret) {
          _results.push('<');
        } else if (fret > referenceFret) {
          _results.push('>');
        } else if (fret === referenceFret) {
          _results.push('=');
        } else {
          _results.push('x');
        }
      }
      return _results;
    })()).join(''));
  }
  return codeStrings;
};

findBarres = function(instrument, fretArray) {
  var barres, codeString, fret, match, run, _i, _len, _ref1;
  barres = [];
  _ref1 = computeBarreCandidateStrings(instrument, fretArray);
  for (fret = _i = 0, _len = _ref1.length; _i < _len; fret = ++_i) {
    codeString = _ref1[fret];
    if (fret === 0) {
      continue;
    }
    if (!codeString) {
      continue;
    }
    match = codeString.match(/(=[>=]+)/);
    if (!match) {
      continue;
    }
    run = match[1];
    if (!(run.match(/\=/g).length > 1)) {
      continue;
    }
    barres.push({
      fret: fret,
      firstString: match.index,
      stringCount: run.length,
      fingerReplacementCount: run.match(/\=/g).length
    });
  }
  return barres;
};

collectBarreSets = function(instrument, fretArray) {
  var barres;
  barres = findBarres(instrument, fretArray);
  return powerset(barres);
};

fingerPositionsOnChord = function(chord, instrument) {
  var pitchClasses, positions, rootPitch;
  rootPitch = chord.rootPitch, pitchClasses = chord.pitchClasses;
  positions = [];
  instrument.eachFingerPosition(function(pos) {
    var degreeIndex, intervalClass;
    intervalClass = intervalClassDifference(rootPitch, instrument.pitchAt(pos));
    degreeIndex = pitchClasses.indexOf(intervalClass);
    if (degreeIndex >= 0) {
      return positions.push(pos);
    }
  });
  return positions;
};

chordFingerings = function(chord, instrument, options) {
  var chordNoteCount, collectFingeringPositions, containsAllChordPitches, countDistinctNotes, filterFingerings, filters, fingering, fingerings, fn, fourFingersOrFewer, fretsPerString, generateFingerings, getFingerCount, hasAllNotes, highNoteCount, isRootPosition, maximumFretDistance, mutedMedialStrings, mutedTrebleStrings, name, preferences, properties, reverseSortKey, sortFingerings, value, warn, _i, _len;
  if (options == null) {
    options = {};
  }
  options = _.extend({
    filter: true,
    allPositions: false
  }, options);
  warn = false;
  if (chord.rootPitch == null) {
    throw new Error("No root for " + (util.inspect(chord)));
  }
  fretsPerString = function() {
    var fret, pos, positions, s, string, strings, _i, _len, _ref1;
    positions = fingerPositionsOnChord(chord, instrument);
    if (!options.allPositions) {
      positions = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = positions.length; _i < _len; _i++) {
          pos = positions[_i];
          if (pos.fret <= 4) {
            _results.push(pos);
          }
        }
        return _results;
      })();
    }
    strings = (function() {
      var _i, _ref1, _results;
      _results = [];
      for (s = _i = 0, _ref1 = instrument.stringCount; 0 <= _ref1 ? _i < _ref1 : _i > _ref1; s = 0 <= _ref1 ? ++_i : --_i) {
        _results.push([null]);
      }
      return _results;
    })();
    for (_i = 0, _len = positions.length; _i < _len; _i++) {
      _ref1 = positions[_i], string = _ref1.string, fret = _ref1.fret;
      strings[string].push(fret);
    }
    return strings;
  };
  collectFingeringPositions = function(fretCandidatesPerString) {
    var fill, fretArray, positionSet, stringCount;
    stringCount = fretCandidatesPerString.length;
    positionSet = [];
    fretArray = [];
    fill = function(s) {
      var fret, _i, _len, _ref1, _results;
      if (s === stringCount) {
        return positionSet.push(fretArray.slice());
      } else {
        _ref1 = fretCandidatesPerString[s];
        _results = [];
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          fret = _ref1[_i];
          fretArray[s] = fret;
          _results.push(fill(s + 1));
        }
        return _results;
      }
    };
    fill(0);
    return positionSet;
  };
  containsAllChordPitches = function(fretArray) {
    var fret, pitchClass, pitches, string, _i, _len;
    pitches = [];
    for (string = _i = 0, _len = fretArray.length; _i < _len; string = ++_i) {
      fret = fretArray[string];
      if (typeof fret !== 'number') {
        continue;
      }
      pitchClass = (instrument.pitchAt({
        fret: fret,
        string: string
      })) % 12;
      if (!(pitches.indexOf(pitchClass) >= 0)) {
        pitches.push(pitchClass);
      }
    }
    return pitches.length === chord.pitchClasses.length;
  };
  maximumFretDistance = function(fretArray) {
    var fret, frets;
    frets = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = fretArray.length; _i < _len; _i++) {
        fret = fretArray[_i];
        if (typeof fret === 'number') {
          _results.push(fret);
        }
      }
      return _results;
    })();
    return Math.max.apply(Math, frets) - Math.min.apply(Math, frets) <= 3;
  };
  generateFingerings = function() {
    var barres, fingerings, fret, fretArray, fretArrays, pos, positions, sets, string, _i, _j, _k, _len, _len1, _len2;
    fingerings = [];
    fretArrays = collectFingeringPositions(fretsPerString());
    fretArrays = fretArrays.filter(containsAllChordPitches);
    fretArrays = fretArrays.filter(maximumFretDistance);
    for (_i = 0, _len = fretArrays.length; _i < _len; _i++) {
      fretArray = fretArrays[_i];
      positions = (function() {
        var _j, _len1, _results;
        _results = [];
        for (string = _j = 0, _len1 = fretArray.length; _j < _len1; string = ++_j) {
          fret = fretArray[string];
          if (typeof fret === 'number') {
            _results.push({
              fret: fret,
              string: string
            });
          }
        }
        return _results;
      })();
      for (_j = 0, _len1 = positions.length; _j < _len1; _j++) {
        pos = positions[_j];
        pos.intervalClass = intervalClassDifference(chord.rootPitch, instrument.pitchAt(pos));
        pos.degreeIndex = chord.pitchClasses.indexOf(pos.intervalClass);
      }
      sets = [[]];
      if (positions.length > 4) {
        sets = collectBarreSets(instrument, fretArray);
      }
      for (_k = 0, _len2 = sets.length; _k < _len2; _k++) {
        barres = sets[_k];
        fingerings.push(new Fingering({
          positions: positions,
          chord: chord,
          barres: barres,
          instrument: instrument
        }));
      }
    }
    return fingerings;
  };
  chordNoteCount = chord.pitchClasses.length;
  countDistinctNotes = function(fingering) {
    var intervalClass, pitches, _i, _len, _ref1;
    pitches = [];
    _ref1 = fingering.positions;
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      intervalClass = _ref1[_i].intervalClass;
      if (__indexOf.call(pitches, intervalClass) < 0) {
        pitches.push(intervalClass);
      }
    }
    return pitches.length;
  };
  hasAllNotes = function(fingering) {
    return countDistinctNotes(fingering) === chordNoteCount;
  };
  mutedMedialStrings = function(fingering) {
    return fingering.fretstring.match(/\dx+\d/);
  };
  mutedTrebleStrings = function(fingering) {
    return fingering.fretstring.match(/x$/);
  };
  getFingerCount = function(fingering) {
    var barre, n, pos, _i, _len, _ref1;
    n = ((function() {
      var _i, _len, _ref1, _results;
      _ref1 = fingering.positions;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        pos = _ref1[_i];
        if (pos.fret > 0) {
          _results.push(pos);
        }
      }
      return _results;
    })()).length;
    _ref1 = fingering.barres;
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      barre = _ref1[_i];
      n -= barre.fingerReplacementCount - 1;
    }
    return n;
  };
  fourFingersOrFewer = function(fingering) {
    return getFingerCount(fingering) <= 4;
  };
  filters = [];
  if (options.filter) {
    filters.push({
      name: 'four fingers or fewer',
      select: fourFingersOrFewer
    });
  }
  if (!options.fingerpicking) {
    filters.push({
      name: 'no muted medial strings',
      reject: mutedMedialStrings
    });
    filters.push({
      name: 'no muted treble strings',
      reject: mutedTrebleStrings
    });
  }
  filterFingerings = function(fingerings) {
    var filtered, name, reject, select, _i, _len, _ref1;
    for (_i = 0, _len = filters.length; _i < _len; _i++) {
      _ref1 = filters[_i], name = _ref1.name, select = _ref1.select, reject = _ref1.reject;
      filtered = fingerings;
      if (reject) {
        select = (function(x) {
          return !reject(x);
        });
      }
      if (select) {
        filtered = filtered.filter(select);
      }
      if (!filtered.length) {
        if (warn) {
          console.warn("" + chord_name + ": no fingerings pass filter \"" + name + "\"");
        }
        filtered = fingerings;
      }
      fingerings = filtered;
    }
    return fingerings;
  };
  highNoteCount = function(fingering) {
    return fingering.positions.length;
  };
  isRootPosition = function(fingering) {
    return _(fingering.positions).sortBy(function(pos) {
      return pos.string;
    })[0].degreeIndex === 0;
  };
  reverseSortKey = function(fn) {
    return function(a) {
      return -fn(a);
    };
  };
  preferences = [
    {
      name: 'root position',
      key: isRootPosition
    }, {
      name: 'high note count',
      key: highNoteCount
    }, {
      name: 'avoid barres',
      key: reverseSortKey(function(fingering) {
        return fingering.barres.length;
      })
    }, {
      name: 'low finger count',
      key: reverseSortKey(getFingerCount)
    }
  ];
  sortFingerings = function(fingerings) {
    var key, _i, _len, _ref1;
    _ref1 = preferences.slice(0).reverse();
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      key = _ref1[_i].key;
      fingerings = _(fingerings).sortBy(key);
    }
    fingerings.reverse();
    return fingerings;
  };
  fingerings = generateFingerings();
  fingerings = filterFingerings(fingerings);
  fingerings = sortFingerings(fingerings);
  properties = {
    root: isRootPosition,
    barres: function(f) {
      return f.barres.length;
    },
    fingers: getFingerCount,
    inversion: function(f) {
      return f.inversionLetter;
    },
    skipping: /\dx+\d/,
    muting: /\dx/,
    open: /0/,
    triad: function(_arg) {
      var positions;
      positions = _arg.positions;
      return positions.length === 3;
    },
    position: function(_arg) {
      var positions;
      positions = _arg.positions;
      return Math.max(_.min(_.pluck(positions, 'fret')) - 1, 0);
    },
    strings: function(_arg) {
      var positions;
      positions = _arg.positions;
      return positions.length;
    }
  };
  for (name in properties) {
    fn = properties[name];
    for (_i = 0, _len = fingerings.length; _i < _len; _i++) {
      fingering = fingerings[_i];
      value = fn instanceof RegExp ? fn.test(fingering.fretstring) : fn(fingering);
      if (value) {
        fingering.properties[name] = value;
      }
    }
  }
  return fingerings;
};

bestFingeringFor = function(chord, instrument) {
  return chordFingerings(chord, instrument)[0];
};

module.exports = {
  bestFingeringFor: bestFingeringFor,
  chordFingerings: chordFingerings
};


},{"./instruments":"B8u3u9","./theory":"80u6C5","./utils":"+Nu4mz","underscore":24,"util":19}],"V9DGE2":[function(require,module,exports){
var DefaultStyle, FretCount, FretNumbers, drawFretboard, drawFretboardFingerPosition, drawFretboardFrets, drawFretboardStrings, paddedFretboardHeight, paddedFretboardWidth, _ref;

_ref = require('./instruments'), FretCount = _ref.FretCount, FretNumbers = _ref.FretNumbers;

DefaultStyle = {
  h_gutter: 10,
  v_gutter: 10,
  string_spacing: 20,
  fret_width: 45,
  fret_overhang: .3 * 45
};

paddedFretboardWidth = function(instrument, style) {
  if (style == null) {
    style = DefaultStyle;
  }
  return 2 * style.v_gutter + style.fret_width * FretCount + style.fret_overhang;
};

paddedFretboardHeight = function(instrument, style) {
  if (style == null) {
    style = DefaultStyle;
  }
  return 2 * style.h_gutter + (instrument.strings - 1) * style.string_spacing;
};

drawFretboardStrings = function(instrument, ctx) {
  var string, style, y, _i, _len, _ref1, _results;
  style = DefaultStyle;
  _ref1 = instrument.stringNumbers;
  _results = [];
  for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
    string = _ref1[_i];
    y = string * style.string_spacing + style.h_gutter;
    ctx.beginPath();
    ctx.moveTo(style.h_gutter, y);
    ctx.lineTo(style.h_gutter + FretCount * style.fret_width + style.fret_overhang, y);
    ctx.lineWidth = 1;
    _results.push(ctx.stroke());
  }
  return _results;
};

drawFretboardFrets = function(ctx, instrument) {
  var fret, style, x, _i, _len, _results;
  style = DefaultStyle;
  _results = [];
  for (_i = 0, _len = FretNumbers.length; _i < _len; _i++) {
    fret = FretNumbers[_i];
    x = style.h_gutter + fret * style.fret_width;
    ctx.beginPath();
    ctx.moveTo(x, style.h_gutter);
    ctx.lineTo(x, style.h_gutter + (instrument.strings - 1) * style.string_spacing);
    if (fret === 0) {
      ctx.lineWidth = 3;
    }
    ctx.stroke();
    _results.push(ctx.lineWidth = 1);
  }
  return _results;
};

drawFretboardFingerPosition = function(ctx, instrument, position, options) {
  var color, fret, isRoot, string, style, x, y;
  if (options == null) {
    options = {};
  }
  string = position.string, fret = position.fret;
  isRoot = options.isRoot, color = options.color;
  style = DefaultStyle;
  color || (color = isRoot ? 'red' : 'white');
  x = style.h_gutter + (fret - 0.5) * style.fret_width;
  if (fret === 0) {
    x = style.h_gutter;
  }
  y = style.v_gutter + (5 - string) * style.string_spacing;
  ctx.beginPath();
  ctx.arc(x, y, 7, 0, 2 * Math.PI, false);
  ctx.fillStyle = color;
  if (!isRoot) {
    ctx.lineWidth = 2;
  }
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = 'black';
  return ctx.lineWidth = 1;
};

drawFretboard = function(ctx, instrument, positions) {
  var position, _i, _len, _ref1, _results;
  drawFretboardStrings(ctx, instrument);
  drawFretboardFrets(ctx, instrument);
  _ref1 = positions || [];
  _results = [];
  for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
    position = _ref1[_i];
    _results.push(drawFretboardFingerPosition(ctx, instrument, position, position));
  }
  return _results;
};

module.exports = {
  draw: drawFretboard,
  height: paddedFretboardHeight,
  width: paddedFretboardWidth
};


},{"./instruments":"B8u3u9"}],"NBDcvj":[function(require,module,exports){
var ChordDiagram, DefaultStyle, IntervalNames, IntervalVectors, block, drawHarmonicTable, drawText, harmonicTableBlock, intervalClassVectors, withAlignment, withGraphicsContext, _, _ref,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

_ = require('underscore');

IntervalNames = require('./theory').IntervalNames;

_ref = require('./layout'), block = _ref.block, drawText = _ref.drawText, withGraphicsContext = _ref.withGraphicsContext, withAlignment = _ref.withAlignment;

ChordDiagram = require('./chord_diagram');

DefaultStyle = {
  intervalClass_colors: ChordDiagram.defaultStyle.intervalClass_colors,
  radius: 50,
  center: true,
  fill_cells: false,
  label_cells: false
};

IntervalVectors = {
  2: {
    P5: -1,
    m3: -1
  },
  3: {
    m3: 1
  },
  4: {
    M3: 1
  },
  5: {
    P5: -1
  },
  6: {
    m3: 2
  },
  11: {
    P5: 1,
    M3: 1
  }
};

intervalClassVectors = function(intervalClass) {
  var adjust, adjustments, computed_semitones, intervals, k, original_intervalClass, record, sign, v, _ref1, _ref2;
  original_intervalClass = intervalClass;
  adjustments = {};
  adjust = function(d_ic, intervals) {
    var k, v, _results;
    intervalClass += d_ic;
    for (k in intervals) {
      if (adjustments[k] == null) {
        adjustments[k] = 0;
      }
    }
    _results = [];
    for (k in intervals) {
      v = intervals[k];
      _results.push(adjustments[k] += v);
    }
    return _results;
  };
  while (intervalClass >= 24) {
    adjust(-24, {
      P5: 4,
      M3: -1
    });
  }
  while (intervalClass >= 12) {
    adjust(-12, {
      M3: 3
    });
  }
  _ref1 = [IntervalVectors[intervalClass], 1], record = _ref1[0], sign = _ref1[1];
  if (!record) {
    _ref2 = [IntervalVectors[12 - intervalClass], -1], record = _ref2[0], sign = _ref2[1];
  }
  intervals = _.extend({
    m3: 0,
    M3: 0,
    P5: 0,
    sign: 1
  }, record);
  for (k in intervals) {
    intervals[k] *= sign;
  }
  for (k in adjustments) {
    v = adjustments[k];
    intervals[k] += v;
  }
  computed_semitones = (12 + intervals.P5 * 7 + intervals.M3 * 4 + intervals.m3 * 3) % 12;
  if (computed_semitones !== original_intervalClass % 12) {
    console.error("Error computing grid position for " + original_intervalClass + ":\n", "  " + original_intervalClass + " ->", intervals, '->', computed_semitones, '!=', original_intervalClass % 12);
  }
  return intervals;
};

drawHarmonicTable = function(intervalClasses, options) {
  var bounds, cell_center, cell_radius, colors, hex_radius, interval_klass, x, y, _i, _len, _ref1;
  if (options == null) {
    options = {};
  }
  options = _.extend({
    draw: true
  }, DefaultStyle, options);
  colors = options.intervalClass_colors;
  if (__indexOf.call(intervalClasses, 0) < 0) {
    intervalClasses = [0].concat(intervalClasses);
  }
  cell_radius = options.radius;
  hex_radius = cell_radius / 2;
  cell_center = function(interval_klass) {
    var dx, dy, vectors, x, y;
    vectors = intervalClassVectors(interval_klass);
    dy = vectors.P5 + (vectors.M3 + vectors.m3) / 2;
    dx = vectors.M3 - vectors.m3;
    x = dx * cell_radius * .8;
    y = -dy * cell_radius * .95;
    return {
      x: x,
      y: y
    };
  };
  bounds = {
    left: Infinity,
    top: Infinity,
    right: -Infinity,
    bottom: -Infinity
  };
  for (_i = 0, _len = intervalClasses.length; _i < _len; _i++) {
    interval_klass = intervalClasses[_i];
    _ref1 = cell_center(interval_klass), x = _ref1.x, y = _ref1.y;
    bounds.left = Math.min(bounds.left, x - hex_radius);
    bounds.top = Math.min(bounds.top, y - hex_radius);
    bounds.right = Math.max(bounds.right, x + hex_radius);
    bounds.bottom = Math.max(bounds.bottom, y + hex_radius);
  }
  if (!options.draw) {
    return {
      width: bounds.right - bounds.left,
      height: bounds.bottom - bounds.top
    };
  }
  return withGraphicsContext(function(ctx) {
    var a, color, i, isRoot, label, pos, _fn, _j, _k, _l, _len1, _len2, _ref2, _ref3, _results;
    ctx.translate(-bounds.left, -bounds.bottom);
    _fn = function() {
      var dn, dx, dy, _ref2;
      _ref2 = [-y, x, 2 / Math.sqrt(x * x + y * y)], dx = _ref2[0], dy = _ref2[1], dn = _ref2[2];
      dx *= dn;
      dy *= dn;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(x + dx, y + dy);
      ctx.lineTo(x - dx, y - dy);
      ctx.fillStyle = color;
      return ctx.fill();
    };
    for (_j = 0, _len1 = intervalClasses.length; _j < _len1; _j++) {
      interval_klass = intervalClasses[_j];
      isRoot = interval_klass === 0;
      color = colors[interval_klass % 12];
      color || (color = colors[12 - interval_klass]);
      ctx.beginPath();
      _ref2 = cell_center(interval_klass), x = _ref2.x, y = _ref2.y;
      for (i = _k = 0; _k <= 6; i = ++_k) {
        a = i * Math.PI / 3;
        pos = [x + hex_radius * Math.cos(a), y + hex_radius * Math.sin(a)];
        if (i === 0) {
          ctx.moveTo.apply(ctx, pos);
        }
        ctx.lineTo.apply(ctx, pos);
      }
      ctx.strokeStyle = 'gray';
      ctx.stroke();
      if (isRoot || (options.fill_cells && interval_klass < 12)) {
        ctx.fillStyle = color || 'rgba(255,0,0,0.15)';
        if (!isRoot) {
          ctx.globalAlpha = 0.3;
        }
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      if (isRoot || options.fill_cells) {
        continue;
      }
      if (options.label_cells) {
        ctx.globalAlpha = 0.3;
      }
      _fn();
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, 2 * Math.PI, false);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    ctx.beginPath();
    ctx.arc(0, 0, 2.5, 0, 2 * Math.PI, false);
    ctx.fillStyle = 'red';
    ctx.fill();
    if (options.label_cells) {
      _results = [];
      for (_l = 0, _len2 = intervalClasses.length; _l < _len2; _l++) {
        interval_klass = intervalClasses[_l];
        label = IntervalNames[interval_klass];
        if (interval_klass === 0) {
          label = 'R';
        }
        _ref3 = cell_center(interval_klass), x = _ref3.x, y = _ref3.y;
        _results.push(drawText(label, {
          font: '10pt Times',
          fillStyle: 'black',
          x: x,
          y: y,
          gravity: 'center'
        }));
      }
      return _results;
    }
  });
};

harmonicTableBlock = function(tones, options) {
  var dimensions;
  dimensions = drawHarmonicTable(tones, _.extend({}, options, {
    compute_bounds: true,
    draw: false
  }));
  return block({
    width: dimensions.width,
    height: dimensions.height,
    draw: function() {
      return drawHarmonicTable(tones, options);
    }
  });
};

module.exports = {
  draw: drawHarmonicTable,
  block: harmonicTableBlock
};


},{"./chord_diagram":"EHWjuh","./layout":"B83s2m","./theory":"80u6C5","underscore":24}],"B8u3u9":[function(require,module,exports){
var FretCount, FretNumbers, Instrument, intervalClassDifference, intervalPositionsFromRoot, pitchFromScientificNotation, _ref;

_ref = require('./theory'), intervalClassDifference = _ref.intervalClassDifference, pitchFromScientificNotation = _ref.pitchFromScientificNotation;

Instrument = (function() {
  function Instrument() {}

  Instrument.prototype.stringCount = 6;

  Instrument.prototype.strings = 6;

  Instrument.prototype.fretCount = 12;

  Instrument.prototype.stringNumbers = [0, 1, 2, 3, 4, 5];

  Instrument.prototype.stringPitches = 'E4 B3 G3 D3 A2 E2'.split(/\s/).reverse().map(pitchFromScientificNotation);

  Instrument.prototype.eachFingerPosition = function(fn) {
    var fret, string, _i, _len, _ref1, _results;
    _ref1 = this.stringNumbers;
    _results = [];
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      string = _ref1[_i];
      _results.push((function() {
        var _j, _ref2, _results1;
        _results1 = [];
        for (fret = _j = 0, _ref2 = this.fretCount; 0 <= _ref2 ? _j <= _ref2 : _j >= _ref2; fret = 0 <= _ref2 ? ++_j : --_j) {
          _results1.push(fn({
            string: string,
            fret: fret
          }));
        }
        return _results1;
      }).call(this));
    }
    return _results;
  };

  Instrument.prototype.pitchAt = function(_arg) {
    var fret, string;
    string = _arg.string, fret = _arg.fret;
    return this.stringPitches[string] + fret;
  };

  return Instrument;

})();

FretNumbers = [0, 1, 2, 3, 4];

FretCount = FretNumbers.length - 1;

intervalPositionsFromRoot = function(instrument, rootPosition, semitones) {
  var positions, rootPitch;
  rootPitch = instrument.pitchAt(rootPosition);
  positions = [];
  fretboard_positions_each(function(fingerPosition) {
    if (intervalClassDifference(rootPitch, instrument.pitchAt(fingerPosition)) !== semitones) {
      return;
    }
    return positions.push(fingerPosition);
  });
  return positions;
};

module.exports = {
  Default: new Instrument,
  FretNumbers: FretNumbers,
  FretCount: FretCount,
  intervalPositionsFromRoot: intervalPositionsFromRoot
};


},{"./theory":"80u6C5"}],"B83s2m":[function(require,module,exports){
var BuildDirectory, Canvas, Context, CurrentBook, CurrentPage, DefaultFilename, Mode, PaperSizes, TDLRLayout, above, box, directory, drawText, erase_background, filename, fs, get_page_size_dimensions, hbox, labeled, measure_text, overlay, padBox, path, save_canvas_to_png, textBox, util, vbox, withBook, withCanvas, withGraphicsContext, withGrid, withGridBoxes, withPage, write_pdf, _,
  __slice = [].slice;

fs = require('fs');

path = require('path');

util = require('util');

_ = require('underscore');

Canvas = require('canvas');

Context = {
  canvas: null,
  ctx: null
};

erase_background = function() {
  var canvas, ctx;
  canvas = Context.canvas, ctx = Context.ctx;
  ctx.fillStyle = 'white';
  return ctx.fillRect(0, 0, canvas.width, canvas.height);
};

measure_text = function(text, _arg) {
  var ctx, font;
  font = (_arg != null ? _arg : {}).font;
  ctx = Context.ctx;
  if (font) {
    ctx.font = font;
  }
  return ctx.measureText(text);
};

drawText = function(text, options) {
  var choice, ctx, fillStyle, font, gravity, m, width, x, y, _i, _len, _ref;
  if (options == null) {
    options = {};
  }
  ctx = Context.ctx;
  if (_.isObject(text)) {
    options = text;
  }
  font = options.font, fillStyle = options.fillStyle, x = options.x, y = options.y, gravity = options.gravity, width = options.width;
  gravity || (gravity = '');
  if (options.choices) {
    _ref = options.choices;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      choice = _ref[_i];
      if (_.isString(choice)) {
        text = choice;
      }
      if (_.isObject(choice)) {
        font = choice.font;
      }
      if (measure_text(text, {
        font: font
      }).width <= options.width) {
        break;
      }
    }
  }
  if (font) {
    ctx.font = font;
  }
  if (fillStyle) {
    ctx.fillStyle = fillStyle;
  }
  m = ctx.measureText(text);
  x || (x = 0);
  y || (y = 0);
  if (gravity.match(/^(top|center|middle|centerbottom)$/i)) {
    x -= m.width / 2;
  }
  if (gravity.match(/^(right|topRight|botRight)$/i)) {
    x -= m.width;
  }
  if (gravity.match(/^(bottom|botLeft|botRight)$/i)) {
    y -= m.emHeightDescent;
  }
  if (gravity.match(/^(top|topLeft|topRight)$/i)) {
    y += m.emHeightAscent;
  }
  return ctx.fillText(text, x, y);
};

withCanvas = function(canvas, cb) {
  var savedCanvas, savedContext;
  savedCanvas = Context.canvas;
  savedContext = Context.context;
  try {
    Context.canvas = canvas;
    Context.ctx = canvas.getContext('2d');
    return cb();
  } finally {
    Context.canvas = savedCanvas;
    Context.context = savedContext;
  }
};

withGraphicsContext = function(fn) {
  var ctx;
  ctx = Context.ctx;
  ctx.save();
  try {
    return fn(ctx);
  } finally {
    ctx.restore();
  }
};

box = function(params) {
  var _ref, _ref1, _ref2;
  box = _.extend({
    width: 0
  }, params);
  if (box.height == null) {
    box.height = ((_ref = box.ascent) != null ? _ref : 0) + ((_ref1 = box.descent) != null ? _ref1 : 0);
  }
  if (box.ascent == null) {
    box.ascent = box.height - ((_ref2 = box.descent) != null ? _ref2 : 0);
  }
  if (box.descent == null) {
    box.descent = box.height - box.ascent;
  }
  return box;
};

padBox = function(box, options) {
  var _ref;
  if (options.bottom) {
    box.height += options.bottom;
  }
  if (options.bottom) {
    box.descent = ((_ref = box.descent) != null ? _ref : 0) + options.bottom;
  }
  return box;
};

textBox = function(text, options) {
  var measure;
  options = _.extend({}, options, {
    gravity: false
  });
  measure = measure_text(text, options);
  return box({
    width: measure.width,
    height: measure.emHeightAscent + measure.emHeightDescent,
    descent: measure.emHeightDescent,
    draw: function() {
      return drawText(text, options);
    }
  });
};

vbox = function() {
  var boxes, boxes_below, descent, height, options, width;
  boxes = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
  options = {};
  if (boxes[boxes.length - 1].width == null) {
    options = boxes.pop();
  }
  options = _.extend({
    align: 'left'
  }, options);
  width = Math.max.apply(Math, _.pluck(boxes, 'width'));
  height = _.pluck(boxes, 'height').reduce(function(a, b) {
    return a + b;
  });
  descent = boxes[boxes.length - 1].descent;
  if (options.baseline) {
    boxes_below = boxes.slice(boxes.indexOf(options.baseline) + 1);
    descent = options.baseline.descent + _.pluck(boxes_below, 'height').reduce((function(a, b) {
      return a + b;
    }), 0);
  }
  return box({
    width: width,
    height: height,
    descent: descent,
    draw: function() {
      var dy;
      dy = -height;
      return boxes.forEach(function(b1) {
        return withGraphicsContext(function(ctx) {
          var dx;
          dx = (function() {
            switch (options.align) {
              case 'left':
                return 0;
              case 'center':
                return Math.max(0, (width - b1.width) / 2);
            }
          })();
          ctx.translate(dx, dy + b1.height - b1.descent);
          if (typeof b1.draw === "function") {
            b1.draw(ctx);
          }
          return dy += b1.height;
        });
      });
    }
  });
};

above = vbox;

hbox = function(b1, b2) {
  var b, boxes, container_size, height, spring_count, width;
  container_size = (typeof CurrentBook !== "undefined" && CurrentBook !== null ? CurrentBook.page_options : void 0) || CurrentPage;
  boxes = [b1, b2];
  height = Math.max.apply(Math, _.pluck(boxes, 'height'));
  width = _.pluck(boxes, 'width').reduce(function(a, b) {
    return a + b;
  });
  if (width === Infinity) {
    width = container_size.width;
  }
  spring_count = ((function() {
    var _i, _len, _results;
    _results = [];
    for (_i = 0, _len = boxes.length; _i < _len; _i++) {
      b = boxes[_i];
      if (b.width === Infinity) {
        _results.push(b);
      }
    }
    return _results;
  })()).length;
  return box({
    width: width,
    height: height,
    draw: function() {
      var x;
      x = 0;
      return boxes.forEach(function(b) {
        withGraphicsContext(function(ctx) {
          ctx.translate(x, 0);
          return typeof b.draw === "function" ? b.draw(ctx) : void 0;
        });
        if (b.width === Infinity) {
          return x += (width - ((function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = boxes.length; _i < _len; _i++) {
              width = boxes[_i].width;
              if (width !== Infinity) {
                _results.push(width);
              }
            }
            return _results;
          })()).reduce(function(a, b) {
            return a + b;
          })) / spring_count;
        } else {
          return x += b.width;
        }
      });
    }
  });
};

overlay = function() {
  var boxes;
  boxes = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
  return box({
    width: Math.max.apply(Math, _.pluck(boxes, 'width')),
    height: Math.max.apply(Math, _.pluck(boxes, 'height')),
    draw: function() {
      var b, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = boxes.length; _i < _len; _i++) {
        b = boxes[_i];
        _results.push(withGraphicsContext(function(ctx) {
          return b.draw(ctx);
        }));
      }
      return _results;
    }
  });
};

labeled = function(text, options, box) {
  var default_options, _ref;
  if (arguments.length === 2) {
    _ref = [{}, options], options = _ref[0], box = _ref[1];
  }
  default_options = {
    font: '12px Times',
    fillStyle: 'black'
  };
  options = _.extend(default_options, options);
  return above(textBox(text, options), box, options);
};

withGridBoxes = function(options, generator) {
  var cell, cell_height, cell_width, cells, container_size, floor, header, line_break, max, max_descent, _i, _len;
  max = Math.max, floor = Math.floor;
  options = _.extend({
    header_height: 0,
    gutter_width: 10,
    gutter_height: 10
  }, options);
  container_size = (typeof CurrentBook !== "undefined" && CurrentBook !== null ? CurrentBook.page_options : void 0) || CurrentPage;
  line_break = {
    width: 0,
    height: 0,
    linebreak: true
  };
  header = null;
  cells = [];
  generator({
    header: function(box) {
      return header = box;
    },
    startRow: function() {
      return cells.push(line_break);
    },
    cell: function(box) {
      return cells.push(box);
    },
    cells: function(boxes) {
      var b, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = boxes.length; _i < _len; _i++) {
        b = boxes[_i];
        _results.push(cells.push(b));
      }
      return _results;
    }
  });
  cell_width = max.apply(null, _.pluck(cells, 'width'));
  cell_height = max.apply(null, _.pluck(cells, 'height'));
  _.extend(options, {
    header_height: (header != null ? header.height : void 0) || 0,
    cell_width: cell_width,
    cell_height: cell_height,
    cols: max(1, floor((container_size.width + options.gutter_width) / (cell_width + options.gutter_width)))
  });
  options.rows = (function() {
    var content_height;
    content_height = container_size.height - options.header_height;
    cell_height = cell_height + options.gutter_height;
    return max(1, floor((content_height + options.gutter_height) / cell_height));
  })();
  for (_i = 0, _len = cells.length; _i < _len; _i++) {
    cell = cells[_i];
    if (cell.descent == null) {
      cell.descent = 0;
    }
  }
  max_descent = max.apply(null, _.pluck(cells, 'descent'));
  return withGrid(options, function(grid) {
    if (header) {
      withGraphicsContext(function(ctx) {
        ctx.translate(0, header.height - header.descent);
        return header != null ? header.draw(ctx) : void 0;
      });
    }
    return cells.forEach(function(cell) {
      if (cell.linebreak != null) {
        grid.startRow();
      }
      if (cell === line_break) {
        return;
      }
      return grid.add_cell(function() {
        return withGraphicsContext(function(ctx) {
          ctx.translate(0, cell_height - cell.descent);
          return cell.draw(ctx);
        });
      });
    });
  });
};

BuildDirectory = '.';

DefaultFilename = null;

directory = function(path) {
  return BuildDirectory = path;
};

filename = function(name) {
  return DefaultFilename = name;
};

save_canvas_to_png = function(canvas, fname) {
  var out, stream;
  out = fs.createWriteStream(path.join(BuildDirectory, fname));
  stream = canvas.pngStream();
  stream.on('data', function(chunk) {
    return out.write(chunk);
  });
  return stream.on('end', function() {
    return console.info("Saved " + fname);
  });
};

PaperSizes = {
  folio: '12in x 15in',
  quarto: '9.5in x 12in',
  octavo: '6in x 9in',
  duodecimo: '5in x 7.375in',
  'ANSI A': '8.5in × 11in',
  'ANSI B': '11in x 17in',
  letter: 'ANSI A',
  ledger: 'ANSI B landscape',
  tabloid: 'ANSI B portrait',
  'ANSI C': '17in × 22in',
  'ANSI D': '22in × 34in',
  'ANSI E': '34in × 44in'
};

get_page_size_dimensions = function(size, orientation) {
  var height, parseMeasure, width, _ref, _ref1, _ref2, _ref3, _ref4;
  if (orientation == null) {
    orientation = null;
  }
  parseMeasure = function(measure) {
    var n, units, _ref;
    if (typeof measure === 'number') {
      return measure;
    }
    if (!measure.match(/^(\d+(?:\.\d*)?)\s*(.+)$/)) {
      throw new Error("Unrecognized measure " + (util.inspect(measure)) + " in " + (util.inspect(size)));
    }
    _ref = [Number(RegExp.$1), RegExp.$2], n = _ref[0], units = _ref[1];
    switch (units) {
      case "":
        return n;
      case "in":
        return n * 72;
      default:
        throw new Error("Unrecognized units " + (util.inspect(units)) + " in " + (util.inspect(size)));
    }
  };
  width = size.width, height = size.height;
  while (_.isString(size)) {
    if (size.match(/^(.+)\s+(landscape|portrait)$/)) {
      _ref = [RegExp.$1, RegExp.R2], size = _ref[0], orientation = _ref[1];
    }
    if (!(size in PaperSizes)) {
      break;
    }
    size = PaperSizes[size];
    width = size.width, height = size.height;
  }
  if (_.isString(size)) {
    if (!size.match(/^(.+?)\s*[x×]\s*(.+)$/)) {
      throw new Error("Unrecognized book size format " + (util.inspect(size)));
    }
    _ref1 = [RegExp.$1, RegExp.$2], width = _ref1[0], height = _ref1[1];
  }
  _ref2 = [parseMeasure(width), parseMeasure(height)], width = _ref2[0], height = _ref2[1];
  switch (orientation || '') {
    case 'landscape':
      if (!(width > height)) {
        _ref3 = [height, width], width = _ref3[0], height = _ref3[1];
      }
      break;
    case 'portrait':
      if (width > height) {
        _ref4 = [height, width], width = _ref4[0], height = _ref4[1];
      }
      break;
    case '':
      null;
      break;
    default:
      throw new Error("Unknown orientation " + (util.inspect(orientation)));
  }
  return {
    width: width,
    height: height
  };
};

(function() {
  var name, value, _results;
  _results = [];
  for (name in PaperSizes) {
    value = PaperSizes[name];
    _results.push(PaperSizes[name] = get_page_size_dimensions(value));
  }
  return _results;
})();

CurrentPage = null;

CurrentBook = null;

Mode = null;

_.mixin({
  sum: (function(plus) {
    return function(xs) {
      return _.reduce(xs, plus, 0);
    };
  })(function(a, b) {
    return a + b;
  })
});

TDLRLayout = function(boxes) {
  var ascent, b, descent, dx, dy, line, page_width, width, _i, _j, _len, _len1, _results;
  page_width = CurrentPage.width - CurrentPage.left_margin - CurrentPage.top_margin;
  boxes = boxes.slice(0);
  for (_i = 0, _len = boxes.length; _i < _len; _i++) {
    b = boxes[_i];
    if (b.descent == null) {
      b.descent = 0;
    }
  }
  dy = 0;
  width = 0;
  _results = [];
  while (boxes.length) {
    console.info('next', boxes.length);
    line = [];
    while (boxes.length) {
      b = boxes[0];
      if (width + b.width > page_width && line.length > 0) {
        break;
      }
      line.push(b);
      boxes.shift();
      width += b.width;
    }
    ascent = _.max((function() {
      var _j, _len1, _results1;
      _results1 = [];
      for (_j = 0, _len1 = line.length; _j < _len1; _j++) {
        b = line[_j];
        _results1.push(b.height - b.descent);
      }
      return _results1;
    })());
    descent = _.chain(line).pluck('descent').max();
    dx = 0;
    console.info('draw', line.length);
    for (_j = 0, _len1 = line.length; _j < _len1; _j++) {
      b = line[_j];
      withGraphicsContext(function(ctx) {
        ctx.translate(dx, dy + ascent);
        console.info('draw', dx, dy + ascent, b.draw);
        return b.draw(ctx);
      });
      dx += b.width;
    }
    _results.push(dy += ascent + descent);
  }
  return _results;
};

withPage = function(options, draw_page) {
  var bottom_margin, boxes, canvas, ctx, defaults, height, left_margin, page, page_margin, right_margin, top_margin, width, _ref;
  if (CurrentPage) {
    throw new Error("Already inside a page");
  }
  defaults = {
    width: 100,
    height: 100,
    page_margin: 10
  };
  _ref = _.extend(defaults, options), width = _ref.width, height = _ref.height, page_margin = _ref.page_margin;
  left_margin = options.left_margin, top_margin = options.top_margin, right_margin = options.right_margin, bottom_margin = options.bottom_margin;
  if (left_margin == null) {
    left_margin = page_margin;
  }
  if (top_margin == null) {
    top_margin = page_margin;
  }
  if (right_margin == null) {
    right_margin = page_margin;
  }
  if (bottom_margin == null) {
    bottom_margin = page_margin;
  }
  canvas = Context.canvas || (Context.canvas = new Canvas(width + left_margin + right_margin, height + top_margin + bottom_margin, Mode));
  ctx = Context.ctx = canvas.getContext('2d');
  if (Mode === 'pdf') {
    ctx.textDrawingMode = 'glyph';
  }
  boxes = [];
  try {
    page = {
      left_margin: left_margin,
      top_margin: top_margin,
      right_margin: right_margin,
      bottom_margin: bottom_margin,
      width: canvas.width,
      height: canvas.height,
      context: ctx,
      box: function(options) {
        return boxes.push(box(options));
      }
    };
    CurrentPage = page;
    erase_background();
    withGraphicsContext(function(ctx) {
      ctx.translate(left_margin, bottom_margin);
      if (CurrentBook != null) {
        if (typeof CurrentBook.header === "function") {
          CurrentBook.header(page);
        }
      }
      if (CurrentBook != null) {
        if (typeof CurrentBook.footer === "function") {
          CurrentBook.footer(page);
        }
      }
      if (typeof draw_page === "function") {
        draw_page(page);
      }
      return TDLRLayout(boxes);
    });
    switch (Mode) {
      case 'pdf':
        return ctx.addPage();
      default:
        filename = "" + (DefaultFilename || 'test') + ".png";
        fs.writeFile(path.join(BuildDirectory, filename), canvas.toBuffer());
        return console.info("Saved " + filename);
    }
  } finally {
    CurrentPage = null;
  }
};

withGrid = function(options, cb) {
  var cell, cell_height, cell_width, cols, defaults, gutter_height, gutter_width, header_height, overflow, rows, _i, _len, _results;
  defaults = {
    gutter_width: 10,
    gutter_height: 10,
    header_height: 0
  };
  options = _.extend(defaults, options);
  cols = options.cols, rows = options.rows, cell_width = options.cell_width, cell_height = options.cell_height, header_height = options.header_height, gutter_width = options.gutter_width, gutter_height = options.gutter_height;
  options.width || (options.width = cols * cell_width + (cols - 1) * gutter_width);
  options.height || (options.height = header_height + rows * cell_height + (rows - 1) * gutter_height);
  overflow = [];
  withPage(options, function(page) {
    return cb({
      context: page.context,
      rows: rows,
      cols: cols,
      row: 0,
      col: 0,
      add_cell: function(draw_fn) {
        var col, row, _ref, _ref1, _ref2;
        _ref = [this.col, this.row], col = _ref[0], row = _ref[1];
        if (row >= rows) {
          overflow.push({
            col: col,
            row: row,
            draw_fn: draw_fn
          });
        } else {
          withGraphicsContext(function(ctx) {
            ctx.translate(col * (cell_width + gutter_width), header_height + row * (cell_height + gutter_height));
            return draw_fn();
          });
        }
        col += 1;
        if (col >= cols) {
          _ref1 = [0, row + 1], col = _ref1[0], row = _ref1[1];
        }
        return _ref2 = [col, row], this.col = _ref2[0], this.row = _ref2[1], _ref2;
      },
      startRow: function() {
        var _ref;
        if (this.col > 0) {
          return _ref = [0, this.row + 1], this.col = _ref[0], this.row = _ref[1], _ref;
        }
      }
    });
  });
  _results = [];
  while (overflow.length) {
    for (_i = 0, _len = overflow.length; _i < _len; _i++) {
      cell = overflow[_i];
      cell.row -= rows;
    }
    withPage(options, function(page) {
      var col, draw_fn, row, _j, _len1, _ref, _ref1, _results1;
      _ref = _.select(overflow, function(cell) {
        return cell.row < rows;
      });
      _results1 = [];
      for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
        _ref1 = _ref[_j], col = _ref1.col, row = _ref1.row, draw_fn = _ref1.draw_fn;
        _results1.push(withGraphicsContext(function(ctx) {
          ctx.translate(col * (cell_width + gutter_width), header_height + row * (cell_height + gutter_height));
          return draw_fn();
        }));
      }
      return _results1;
    });
    _results.push(overflow = (function() {
      var _j, _len1, _results1;
      _results1 = [];
      for (_j = 0, _len1 = overflow.length; _j < _len1; _j++) {
        cell = overflow[_j];
        if (cell.row >= rows) {
          _results1.push(cell);
        }
      }
      return _results1;
    })());
  }
  return _results;
};

withBook = function(filename, options, cb) {
  var book, canvas, ctx, height, page_count, page_limit, size, width, _ref, _ref1;
  if (CurrentBook) {
    throw new Error("withBook called recursively");
  }
  if (_.isFunction(options)) {
    _ref = [{}, options], options = _ref[0], cb = _ref[1];
  }
  page_limit = options.page_limit;
  page_count = 0;
  try {
    book = {
      page_options: {}
    };
    Mode = 'pdf';
    CurrentBook = book;
    size = options.size;
    if (size) {
      _ref1 = get_page_size_dimensions(size), width = _ref1.width, height = _ref1.height;
      _.extend(book.page_options, {
        width: width,
        height: height
      });
      canvas = Context.canvas || (Context.canvas = new Canvas(width, height, Mode));
      ctx = Context.ctx = canvas.getContext('2d');
      if (Mode === 'pdf') {
        ctx.textDrawingMode = 'glyph';
      }
    }
    cb({
      page_header: function(header) {
        return book.header = header;
      },
      page_footer: function(footer) {
        return book.footer = footer;
      },
      withPage: function(options, draw_page) {
        var _ref2;
        if (_.isFunction(options)) {
          _ref2 = [{}, options], options = _ref2[0], draw_page = _ref2[1];
        }
        if (this.done) {
          return;
        }
        options = _.extend({}, book.page_options, options);
        page_count += 1;
        if (CurrentPage) {
          draw_page(CurrentPage);
        } else {
          withPage(options, draw_page);
        }
        if (page_limit && page_limit <= page_count) {
          return this.done = true;
        }
      }
    });
    if (canvas) {
      return write_pdf(canvas, path.join(BuildDirectory, "" + filename + ".pdf"));
    } else {
      return console.warn("No pages");
    }
  } finally {
    CurrentBook = null;
    Mode = null;
    canvas = null;
    ctx = null;
  }
};

write_pdf = function(canvas, pathname) {
  return fs.writeFile(pathname, canvas.toBuffer(), function(err) {
    if (err) {
      return console.error("Error " + err.code + " writing to " + err.path);
    } else {
      return console.info("Saved " + pathname);
    }
  });
};

module.exports = {
  PaperSizes: PaperSizes,
  above: above,
  withBook: withBook,
  withGrid: withGrid,
  withGridBoxes: withGridBoxes,
  drawText: drawText,
  box: box,
  hbox: hbox,
  textBox: textBox,
  labeled: labeled,
  measure_text: measure_text,
  directory: directory,
  filename: filename,
  withGraphicsContext: withGraphicsContext,
  withCanvas: withCanvas
};


},{"canvas":"QgR0mD","fs":13,"path":18,"underscore":24,"util":19}],"e0n95g":[function(require,module,exports){
var ChordDiagramStyle, PI, block, cos, draw_pitch_diagram, max, min, pitch_diagram_block, sin, withGraphicsContext, _ref;

PI = Math.PI, cos = Math.cos, sin = Math.sin, min = Math.min, max = Math.max;

ChordDiagramStyle = require('./chord_diagram').defaultStyle;

_ref = require('./layout'), block = _ref.block, withGraphicsContext = _ref.withGraphicsContext;

draw_pitch_diagram = function(ctx, pitchClasses, options) {
  var angle, bounds, class_name, extend_bounds, m, pitchClass, pitch_class_angle, pitch_colors, pitch_names, r, r_label, x, y, _i, _j, _len, _len1;
  if (options == null) {
    options = {
      draw: true
    };
  }
  pitch_colors = options.pitch_colors, pitch_names = options.pitch_names;
  pitch_colors || (pitch_colors = ChordDiagramStyle.interval_class_colors);
  pitch_names || (pitch_names = 'R m2 M2 m3 M3 P4 TT P5 m6 M6 m7 M7'.split(/\s/));
  r = 10;
  r_label = r + 7;
  pitch_class_angle = function(pitchClass) {
    return (pitchClass - 3) * 2 * PI / 12;
  };
  bounds = {
    left: 0,
    top: 0,
    right: 0,
    bottom: 0
  };
  extend_bounds = function(left, top, bottom, right) {
    bounds.left = min(bounds.left, left);
    bounds.top = min(bounds.top, top);
    bounds.right = max(bounds.right, right != null ? right : left);
    return bounds.bottom = max(bounds.bottom, bottom != null ? bottom : top);
  };
  for (_i = 0, _len = pitchClasses.length; _i < _len; _i++) {
    pitchClass = pitchClasses[_i];
    angle = pitch_class_angle(pitchClass);
    x = r * cos(angle);
    y = r * sin(angle);
    if (options.draw) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
    extend_bounds(x, y);
    if (options.draw) {
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, 2 * PI, false);
      ctx.fillStyle = pitch_colors[pitchClass] || 'black';
      ctx.fill();
    }
  }
  ctx.font = '4pt Times';
  ctx.fillStyle = 'black';
  for (pitchClass = _j = 0, _len1 = pitch_names.length; _j < _len1; pitchClass = ++_j) {
    class_name = pitch_names[pitchClass];
    angle = pitch_class_angle(pitchClass);
    m = ctx.measureText(class_name);
    x = r_label * cos(angle) - m.width / 2;
    y = r_label * sin(angle) + m.emHeightDescent;
    if (options.draw) {
      ctx.fillText(class_name, x, y);
    }
    bounds.left = min(bounds.left, x);
    bounds.right = max(bounds.right, x + m.width);
    bounds.top = min(bounds.top, y - m.emHeightAscent);
    bounds.bottom = max(bounds.bottom, y + m.emHeightAscent);
  }
  return bounds;
};

pitch_diagram_block = function(pitchClasses, scale) {
  var bounds;
  if (scale == null) {
    scale = 1;
  }
  bounds = withGraphicsContext(function(ctx) {
    return draw_pitch_diagram(ctx, pitchClasses, {
      draw: false,
      measure: true
    });
  });
  return block({
    width: (bounds.right - bounds.left) * scale,
    height: (bounds.bottom - bounds.top) * scale,
    draw: function() {
      return withGraphicsContext(function(ctx) {
        ctx.scale(scale, scale);
        ctx.translate(-bounds.left, -bounds.bottom);
        return draw_pitch_diagram(ctx, pitchClasses);
      });
    }
  });
};

module.exports = {
  draw: draw_pitch_diagram,
  block: pitch_diagram_block
};


},{"./chord_diagram":"EHWjuh","./layout":"B83s2m"}],"80u6C5":[function(require,module,exports){
var AccidentalValues, Chord, ChordDefinitions, Chords, FlatNoteNames, FunctionQualities, Functions, IntervalNames, LongIntervalNames, Modes, NoteNames, Scale, Scales, SharpNoteNames, getPitchClassName, getPitchName, intervalClassDifference, normalizePitchClass, parseChordNumeral, parsePitchClass, pitchFromScientificNotation;

SharpNoteNames = 'C C# D D# E F F# G G# A A# B'.replace(/#/g, '\u266F').split(/\s/);

FlatNoteNames = 'C Db D Eb E F Gb G Ab A Bb B'.replace(/b/g, '\u266D').split(/\s/);

NoteNames = SharpNoteNames;

AccidentalValues = {
  '#': 1,
  '♯': 1,
  'b': -1,
  '♭': -1,
  '𝄪': 2,
  '𝄫': -2
};

IntervalNames = ['P1', 'm2', 'M2', 'm3', 'M3', 'P4', 'TT', 'P5', 'm6', 'M6', 'm7', 'M7', 'P8'];

LongIntervalNames = ['Unison', 'Minor 2nd', 'Major 2nd', 'Minor 3rd', 'Major 3rd', 'Perfect 4th', 'Tritone', 'Perfect 5th', 'Minor 6th', 'Major 6th', 'Minor 7th', 'Major 7th', 'Octave'];

getPitchClassName = function(pitchClass) {
  return NoteNames[normalizePitchClass(pitchClass)];
};

getPitchName = function(pitch) {
  if (typeof pitch === 'string') {
    return pitch;
  }
  return getPitchClassName(pitch);
};

intervalClassDifference = function(pca, pcb) {
  return normalizePitchClass(pcb - pca);
};

normalizePitchClass = function(pitchClass) {
  return ((pitchClass % 12) + 12) % 12;
};

pitchFromScientificNotation = function(name) {
  var accidentals, c, match, naturalName, octave, pitch, _i, _len, _ref;
  match = name.match(/^([A-G])([#♯b♭𝄪𝄫]*)(\d+)$/i);
  if (!match) {
    throw new Error("" + name + " is not in scientific notation");
  }
  _ref = match.slice(1), naturalName = _ref[0], accidentals = _ref[1], octave = _ref[2];
  pitch = SharpNoteNames.indexOf(naturalName.toUpperCase()) + 12 * (1 + Number(octave));
  for (_i = 0, _len = accidentals.length; _i < _len; _i++) {
    c = accidentals[_i];
    pitch += AccidentalValues[c];
  }
  return pitch;
};

parsePitchClass = function(name) {
  var accidentals, c, match, naturalName, pitch, _i, _len, _ref;
  match = name.match(/^([A-G])([#♯b♭𝄪𝄫]*)$/i);
  if (!match) {
    throw new Error("" + name + " is not a pitch class name");
  }
  _ref = match.slice(1), naturalName = _ref[0], accidentals = _ref[1];
  pitch = SharpNoteNames.indexOf(naturalName.toUpperCase());
  for (_i = 0, _len = accidentals.length; _i < _len; _i++) {
    c = accidentals[_i];
    pitch += AccidentalValues[c];
  }
  return pitch;
};

Scale = (function() {
  function Scale(_arg) {
    this.name = _arg.name, this.pitches = _arg.pitches, this.tonicName = _arg.tonicName;
    if (this.tonicName) {
      this.tonicPitch || (this.tonicPitch = parsePitchClass(this.tonicName));
    }
  }

  Scale.prototype.at = function(tonicName) {
    return new Scale({
      name: this.name,
      pitches: this.pitches,
      tonicName: tonicName
    });
  };

  Scale.prototype.chords = function(options) {
    var degree, degrees, i, noteNames, pitches, _i, _ref, _results,
      _this = this;
    if (options == null) {
      options = {};
    }
    if (this.tonicPitch == null) {
      throw new Error("only implemented for scales with tonics");
    }
    noteNames = SharpNoteNames;
    if (noteNames.indexOf(this.tonicName) < 0 || this.tonicName === 'F') {
      noteNames = FlatNoteNames;
    }
    degrees = [0, 2, 4];
    if (options.sevenths) {
      degrees.push(6);
    }
    _results = [];
    for (i = _i = 0, _ref = this.pitches.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
      pitches = this.pitches.slice(i).concat(this.pitches.slice(0, i));
      pitches = ((function() {
        var _j, _len, _results1;
        _results1 = [];
        for (_j = 0, _len = degrees.length; _j < _len; _j++) {
          degree = degrees[_j];
          _results1.push(pitches[degree]);
        }
        return _results1;
      })()).map(function(n) {
        return (n + _this.tonicPitch) % 12;
      });
      _results.push(Chord.fromPitches(pitches).enharmonicizeTo(noteNames));
    }
    return _results;
  };

  Scale.find = function(tonicName) {
    var scaleName;
    scaleName = 'Diatonic Major';
    return Scales[scaleName].at(tonicName);
  };

  return Scale;

})();

Scales = (function() {
  var name, pitches, scale_specs, spec, _i, _len, _ref, _results;
  scale_specs = ['Diatonic Major: 024579e', 'Natural Minor: 023578t', 'Melodic Minor: 023579e', 'Harmonic Minor: 023578e', 'Pentatonic Major: 02479', 'Pentatonic Minor: 0357t', 'Blues: 03567t', 'Freygish: 014578t', 'Whole Tone: 02468t', 'Octatonic: 0235689e'];
  _results = [];
  for (_i = 0, _len = scale_specs.length; _i < _len; _i++) {
    spec = scale_specs[_i];
    _ref = spec.split(/:\s*/, 2), name = _ref[0], pitches = _ref[1];
    pitches = pitches.match(/./g).map(function(c) {
      return {
        't': 10,
        'e': 11
      }[c] || Number(c);
    });
    _results.push(new Scale({
      name: name,
      pitches: pitches
    }));
  }
  return _results;
})();

(function() {
  var scale, _i, _len, _results;
  _results = [];
  for (_i = 0, _len = Scales.length; _i < _len; _i++) {
    scale = Scales[_i];
    _results.push(Scales[scale.name] = scale);
  }
  return _results;
})();

Modes = (function() {
  var d, delta, i, modeNames, name, pitches, rootTones, _i, _len, _results;
  rootTones = Scales['Diatonic Major'].pitches;
  modeNames = 'Ionian Dorian Phrygian Lydian Mixolydian Aeolian Locrian'.split(/\s/);
  _results = [];
  for (i = _i = 0, _len = rootTones.length; _i < _len; i = ++_i) {
    delta = rootTones[i];
    name = modeNames[i];
    pitches = (function() {
      var _j, _len1, _ref, _results1;
      _ref = rootTones.slice(i).concat(rootTones.slice(0, i));
      _results1 = [];
      for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
        d = _ref[_j];
        _results1.push((d - delta + 12) % 12);
      }
      return _results1;
    })();
    _results.push(new Scale({
      name: name,
      pitches: pitches
    }));
  }
  return _results;
})();

(function() {
  var mode, _i, _len, _results;
  _results = [];
  for (_i = 0, _len = Modes.length; _i < _len; _i++) {
    mode = Modes[_i];
    _results.push(Modes[mode.name] = mode);
  }
  return _results;
})();

Functions = 'Tonic Supertonic Mediant Subdominant Dominant Submediant Subtonic Leading'.split(/\s/);

parseChordNumeral = function(name) {
  var chord;
  chord = {
    degree: 'i ii iii iv v vi vii'.indexOf(name.match(/[iv+]/i)[1]) + 1,
    major: name === name.toUpperCase(),
    flat: name.match(/^b/),
    diminished: name.match(/°/),
    augmented: name.match(/\+/)
  };
  return chord;
};

FunctionQualities = {
  major: 'I ii iii IV V vi vii°'.split(/\s/).map(parseChordNumeral),
  minor: 'i ii° bIII iv v bVI bVII'.split(/\s/).map(parseChordNumeral)
};

Chord = (function() {
  function Chord(_arg) {
    var degree, degrees, i, pc, pci, rootlessAbbr, rootlessFullName;
    this.name = _arg.name, this.fullName = _arg.fullName, this.abbr = _arg.abbr, this.abbrs = _arg.abbrs, this.pitchClasses = _arg.pitchClasses, this.rootName = _arg.rootName, this.rootPitch = _arg.rootPitch;
    if (this.abbrs == null) {
      this.abbrs = [this.abbr];
    }
    if (typeof this.abbrs === 'string') {
      this.abbrs = this.abbrs.split(/s/);
    }
    if (this.abbr == null) {
      this.abbr = this.abbrs[0];
    }
    if (this.rootPitch != null) {
      this.rootName || (this.rootName = NoteNames[this.rootPitch]);
    }
    if (this.rootName != null) {
      if (this.rootPitch == null) {
        this.rootPitch = parsePitchClass(this.rootName);
      }
      rootlessAbbr = this.abbr;
      rootlessFullName = this.fullName;
      Object.defineProperty(this, 'name', {
        get: function() {
          return "" + this.rootName + rootlessAbbr;
        }
      });
      Object.defineProperty(this, 'fullName', {
        get: function() {
          return "" + this.rootName + " " + rootlessFullName;
        }
      });
    }
    degrees = (function() {
      var _i, _ref, _results;
      _results = [];
      for (i = _i = 0, _ref = this.pitchClasses.length; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        _results.push(1 + 2 * i);
      }
      return _results;
    }).call(this);
    degrees[1] = {
      'Sus2': 2,
      'Sus4': 4
    }[this.name] || degrees[1];
    if (this.name.match(/6/)) {
      degrees[3] = 6;
    }
    this.components = (function() {
      var _i, _len, _ref, _ref1, _ref2, _ref3, _results;
      _ref = this.pitchClasses;
      _results = [];
      for (pci = _i = 0, _len = _ref.length; _i < _len; pci = ++_i) {
        pc = _ref[pci];
        name = IntervalNames[pc];
        degree = degrees[pci];
        if (pc === 0) {
          name = 'R';
        } else if (Number((_ref1 = name.match(/\d+/)) != null ? _ref1[0] : void 0) !== degree) {
          if (Number((_ref2 = IntervalNames[pc - 1].match(/\d+/)) != null ? _ref2[0] : void 0) === degree) {
            name = "A" + degree;
          }
          if (Number((_ref3 = IntervalNames[pc + 1].match(/\d+/)) != null ? _ref3[0] : void 0) === degree) {
            name = "d" + degree;
          }
        }
        _results.push(name);
      }
      return _results;
    }).call(this);
  }

  Chord.prototype.at = function(rootNameOrPitch) {
    var rootName, rootPitch, _ref;
    _ref = (function() {
      switch (typeof rootNameOrPitch) {
        case 'string':
          return [rootNameOrPitch, null];
        case 'number':
          return [null, rootNameOrPitch];
        default:
          throw new Error("#rootNameOrPitch} must be a pitch name or number");
      }
    })(), rootName = _ref[0], rootPitch = _ref[1];
    return new Chord({
      name: this.name,
      abbrs: this.abbrs,
      fullName: this.fullName,
      pitchClasses: this.pitchClasses,
      rootName: rootName,
      rootPitch: rootPitch
    });
  };

  Chord.prototype.degreeName = function(degreeIndex) {
    return this.components[degreeIndex];
  };

  Chord.prototype.enharmonicizeTo = function(pitchNameArray) {
    var pitchClass, pitchName, _i, _len;
    for (pitchClass = _i = 0, _len = pitchNameArray.length; _i < _len; pitchClass = ++_i) {
      pitchName = pitchNameArray[pitchClass];
      if (this.rootPitch === pitchClass) {
        this.rootName = pitchName;
      }
    }
    return this;
  };

  Chord.find = function(name) {
    var chordName, match, noteName, _ref;
    match = name.match(/^([a-gA-G][#b♯♭]*)(.*)$/);
    if (!match) {
      throw new Error("" + name + " is not a chord name");
    }
    _ref = match.slice(1), noteName = _ref[0], chordName = _ref[1];
    if (!Chords[chordName]) {
      throw new Error("" + name + " is not a chord name");
    }
    return Chords[chordName].at(noteName);
  };

  Chord.fromPitches = function(pitches) {
    var pitch, root;
    root = pitches[0];
    return Chord.fromPitchClasses((function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = pitches.length; _i < _len; _i++) {
        pitch = pitches[_i];
        _results.push(pitch - root);
      }
      return _results;
    })()).at(root);
  };

  Chord.fromPitchClasses = function(pitchClasses) {
    var chord, n;
    pitchClasses = ((function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = pitchClasses.length; _i < _len; _i++) {
        n = pitchClasses[_i];
        _results.push((n + 12) % 12);
      }
      return _results;
    })()).sort(function(a, b) {
      return a > b;
    });
    chord = Chords[pitchClasses];
    if (!chord) {
      throw new Error("Couldn''t find chord with pitch classes " + pitchClasses);
    }
    return chord;
  };

  return Chord;

})();

ChordDefinitions = [
  {
    name: 'Major',
    abbrs: ['', 'M'],
    pitchClasses: '047'
  }, {
    name: 'Minor',
    abbr: 'm',
    pitchClasses: '037'
  }, {
    name: 'Augmented',
    abbrs: ['+', 'aug'],
    pitchClasses: '048'
  }, {
    name: 'Diminished',
    abbrs: ['°', 'dim'],
    pitchClasses: '036'
  }, {
    name: 'Sus2',
    abbr: 'sus2',
    pitchClasses: '027'
  }, {
    name: 'Sus4',
    abbr: 'sus4',
    pitchClasses: '057'
  }, {
    name: 'Dominant 7th',
    abbrs: ['7', 'dom7'],
    pitchClasses: '047t'
  }, {
    name: 'Augmented 7th',
    abbrs: ['+7', '7aug'],
    pitchClasses: '048t'
  }, {
    name: 'Diminished 7th',
    abbrs: ['°7', 'dim7'],
    pitchClasses: '0369'
  }, {
    name: 'Major 7th',
    abbr: 'maj7',
    pitchClasses: '047e'
  }, {
    name: 'Minor 7th',
    abbr: 'min7',
    pitchClasses: '037t'
  }, {
    name: 'Dominant 7b5',
    abbr: '7b5',
    pitchClasses: '046t'
  }, {
    name: 'Minor 7th b5',
    abbrs: ['ø', 'Ø', 'm7b5'],
    pitchClasses: '036t'
  }, {
    name: 'Diminished Maj 7th',
    abbr: '°Maj7',
    pitchClasses: '036e'
  }, {
    name: 'Minor-Major 7th',
    abbrs: ['min/maj7', 'min(maj7)'],
    pitchClasses: '037e'
  }, {
    name: '6th',
    abbrs: ['6', 'M6', 'M6', 'maj6'],
    pitchClasses: '0479'
  }, {
    name: 'Minor 6th',
    abbrs: ['m6', 'min6'],
    pitchClasses: '0379'
  }
];

Chords = ChordDefinitions.map(function(spec) {
  spec.fullName = spec.name;
  spec.name = spec.name.replace(/Major(?!$)/, 'Maj').replace(/Minor(?!$)/, 'Min').replace('Dominant', 'Dom').replace('Diminished', 'Dim');
  spec.abbrs || (spec.abbrs = [spec.abbr]);
  if (typeof spec.abbrs === 'string') {
    spec.abbrs = spec.abbrs.split(/s/);
  }
  spec.abbr || (spec.abbr = spec.abbrs[0]);
  spec.pitchClasses = spec.pitchClasses.match(/./g).map(function(c) {
    return {
      't': 10,
      'e': 11
    }[c] || Number(c);
  });
  return new Chord(spec);
});

(function() {
  var abbrs, chord, fullName, key, name, _i, _j, _len, _len1, _ref, _results;
  _results = [];
  for (_i = 0, _len = Chords.length; _i < _len; _i++) {
    chord = Chords[_i];
    name = chord.name, fullName = chord.fullName, abbrs = chord.abbrs;
    _ref = [name, fullName].concat(abbrs);
    for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
      key = _ref[_j];
      Chords[key] = chord;
    }
    _results.push(Chords[chord.pitchClasses] = chord);
  }
  return _results;
})();

module.exports = {
  Chord: Chord,
  Chords: Chords,
  IntervalNames: IntervalNames,
  LongIntervalNames: LongIntervalNames,
  Modes: Modes,
  NoteNames: NoteNames,
  Scale: Scale,
  Scales: Scales,
  getPitchClassName: getPitchClassName,
  intervalClassDifference: intervalClassDifference,
  pitchFromScientificNotation: pitchFromScientificNotation
};


},{}],"+Nu4mz":[function(require,module,exports){
var hsv2css, hsv2rgb, rgb2css, _base, _base1;

(_base = Function.prototype).define || (_base.define = function(name, desc) {
  return Object.defineProperty(this.prototype, name, desc);
});

(_base1 = Function.prototype).cached_getter || (_base1.cached_getter = function(name, fn) {
  return Object.defineProperty(this.prototype, name, {
    get: function() {
      var cache;
      cache = this._getter_cache || (this._getter_cache = {});
      if (name in cache) {
        return cache[name];
      }
      return cache[name] = fn.call(this);
    }
  });
});

hsv2rgb = function(_arg) {
  var b, c, component, components, g, h, r, s, v, x, _ref;
  h = _arg.h, s = _arg.s, v = _arg.v;
  h /= 360;
  c = v * s;
  x = c * (1 - Math.abs((h * 6) % 2 - 1));
  components = (function() {
    switch (Math.floor(h * 6) % 6) {
      case 0:
        return [c, x, 0];
      case 1:
        return [x, c, 0];
      case 2:
        return [0, c, x];
      case 3:
        return [0, x, c];
      case 4:
        return [x, 0, c];
      case 5:
        return [c, 0, x];
    }
  })();
  _ref = (function() {
    var _i, _len, _results;
    _results = [];
    for (_i = 0, _len = components.length; _i < _len; _i++) {
      component = components[_i];
      _results.push(component + v - c);
    }
    return _results;
  })(), r = _ref[0], g = _ref[1], b = _ref[2];
  return {
    r: r,
    g: g,
    b: b
  };
};

rgb2css = function(_arg) {
  var b, c, g, r, _ref;
  r = _arg.r, g = _arg.g, b = _arg.b;
  _ref = (function() {
    var _i, _len, _ref, _results;
    _ref = [r, g, b];
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      c = _ref[_i];
      _results.push(Math.floor(255 * c));
    }
    return _results;
  })(), r = _ref[0], g = _ref[1], b = _ref[2];
  return "rgb(" + r + ", " + g + ", " + b + ")";
};

hsv2css = function(hsv) {
  return rgb2css(hsv2rgb(hsv));
};

module.exports = {
  hsv2css: hsv2css,
  hsv2rgb: hsv2rgb,
  rgb2css: rgb2css
};


},{}],12:[function(require,module,exports){
var process=require("__browserify_process");if (!process.EventEmitter) process.EventEmitter = function () {};

var EventEmitter = exports.EventEmitter = process.EventEmitter;
var isArray = typeof Array.isArray === 'function'
    ? Array.isArray
    : function (xs) {
        return Object.prototype.toString.call(xs) === '[object Array]'
    }
;
function indexOf (xs, x) {
    if (xs.indexOf) return xs.indexOf(x);
    for (var i = 0; i < xs.length; i++) {
        if (x === xs[i]) return i;
    }
    return -1;
}

// By default EventEmitters will print a warning if more than
// 10 listeners are added to it. This is a useful default which
// helps finding memory leaks.
//
// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
var defaultMaxListeners = 10;
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!this._events) this._events = {};
  this._events.maxListeners = n;
};


EventEmitter.prototype.emit = function(type) {
  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events || !this._events.error ||
        (isArray(this._events.error) && !this._events.error.length))
    {
      if (arguments[1] instanceof Error) {
        throw arguments[1]; // Unhandled 'error' event
      } else {
        throw new Error("Uncaught, unspecified 'error' event.");
      }
      return false;
    }
  }

  if (!this._events) return false;
  var handler = this._events[type];
  if (!handler) return false;

  if (typeof handler == 'function') {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        var args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
    return true;

  } else if (isArray(handler)) {
    var args = Array.prototype.slice.call(arguments, 1);

    var listeners = handler.slice();
    for (var i = 0, l = listeners.length; i < l; i++) {
      listeners[i].apply(this, args);
    }
    return true;

  } else {
    return false;
  }
};

// EventEmitter is defined in src/node_events.cc
// EventEmitter.prototype.emit() is also defined there.
EventEmitter.prototype.addListener = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('addListener only takes instances of Function');
  }

  if (!this._events) this._events = {};

  // To avoid recursion in the case that type == "newListeners"! Before
  // adding it to the listeners, first emit "newListeners".
  this.emit('newListener', type, listener);

  if (!this._events[type]) {
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  } else if (isArray(this._events[type])) {

    // Check for listener leak
    if (!this._events[type].warned) {
      var m;
      if (this._events.maxListeners !== undefined) {
        m = this._events.maxListeners;
      } else {
        m = defaultMaxListeners;
      }

      if (m && m > 0 && this._events[type].length > m) {
        this._events[type].warned = true;
        console.error('(node) warning: possible EventEmitter memory ' +
                      'leak detected. %d listeners added. ' +
                      'Use emitter.setMaxListeners() to increase limit.',
                      this._events[type].length);
        console.trace();
      }
    }

    // If we've already got an array, just append.
    this._events[type].push(listener);
  } else {
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  var self = this;
  self.on(type, function g() {
    self.removeListener(type, g);
    listener.apply(this, arguments);
  });

  return this;
};

EventEmitter.prototype.removeListener = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('removeListener only takes instances of Function');
  }

  // does not use listeners(), so no side effect of creating _events[type]
  if (!this._events || !this._events[type]) return this;

  var list = this._events[type];

  if (isArray(list)) {
    var i = indexOf(list, listener);
    if (i < 0) return this;
    list.splice(i, 1);
    if (list.length == 0)
      delete this._events[type];
  } else if (this._events[type] === listener) {
    delete this._events[type];
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  if (arguments.length === 0) {
    this._events = {};
    return this;
  }

  // does not use listeners(), so no side effect of creating _events[type]
  if (type && this._events && this._events[type]) this._events[type] = null;
  return this;
};

EventEmitter.prototype.listeners = function(type) {
  if (!this._events) this._events = {};
  if (!this._events[type]) this._events[type] = [];
  if (!isArray(this._events[type])) {
    this._events[type] = [this._events[type]];
  }
  return this._events[type];
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (typeof emitter._events[type] === 'function')
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

},{"__browserify_process":23}],13:[function(require,module,exports){
// nothing to see here... no file methods for the browser

},{}],"./harmonic_table":[function(require,module,exports){
module.exports=require('NBDcvj');
},{}],"./theory":[function(require,module,exports){
module.exports=require('80u6C5');
},{}],"./fretboard_diagram":[function(require,module,exports){
module.exports=require('V9DGE2');
},{}],"canvas":[function(require,module,exports){
module.exports=require('QgR0mD');
},{}],18:[function(require,module,exports){
var process=require("__browserify_process");function filter (xs, fn) {
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (fn(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length; i >= 0; i--) {
    var last = parts[i];
    if (last == '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Regex to split a filename into [*, dir, basename, ext]
// posix version
var splitPathRe = /^(.+\/(?!$)|\/)?((?:.+?)?(\.[^.]*)?)$/;

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
var resolvedPath = '',
    resolvedAbsolute = false;

for (var i = arguments.length; i >= -1 && !resolvedAbsolute; i--) {
  var path = (i >= 0)
      ? arguments[i]
      : process.cwd();

  // Skip empty and invalid entries
  if (typeof path !== 'string' || !path) {
    continue;
  }

  resolvedPath = path + '/' + resolvedPath;
  resolvedAbsolute = path.charAt(0) === '/';
}

// At this point the path should be resolved to a full absolute path, but
// handle relative paths to be safe (might happen when process.cwd() fails)

// Normalize the path
resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
var isAbsolute = path.charAt(0) === '/',
    trailingSlash = path.slice(-1) === '/';

// Normalize the path
path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }
  
  return (isAbsolute ? '/' : '') + path;
};


// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    return p && typeof p === 'string';
  }).join('/'));
};


exports.dirname = function(path) {
  var dir = splitPathRe.exec(path)[1] || '';
  var isWindows = false;
  if (!dir) {
    // No dirname
    return '.';
  } else if (dir.length === 1 ||
      (isWindows && dir.length <= 3 && dir.charAt(1) === ':')) {
    // It is just a slash or a drive letter with a slash
    return dir;
  } else {
    // It is a full dirname, strip trailing slash
    return dir.substring(0, dir.length - 1);
  }
};


exports.basename = function(path, ext) {
  var f = splitPathRe.exec(path)[2] || '';
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPathRe.exec(path)[3] || '';
};

exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';

},{"__browserify_process":23}],19:[function(require,module,exports){
var events = require('events');

exports.isArray = isArray;
exports.isDate = function(obj){return Object.prototype.toString.call(obj) === '[object Date]'};
exports.isRegExp = function(obj){return Object.prototype.toString.call(obj) === '[object RegExp]'};


exports.print = function () {};
exports.puts = function () {};
exports.debug = function() {};

exports.inspect = function(obj, showHidden, depth, colors) {
  var seen = [];

  var stylize = function(str, styleType) {
    // http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
    var styles =
        { 'bold' : [1, 22],
          'italic' : [3, 23],
          'underline' : [4, 24],
          'inverse' : [7, 27],
          'white' : [37, 39],
          'grey' : [90, 39],
          'black' : [30, 39],
          'blue' : [34, 39],
          'cyan' : [36, 39],
          'green' : [32, 39],
          'magenta' : [35, 39],
          'red' : [31, 39],
          'yellow' : [33, 39] };

    var style =
        { 'special': 'cyan',
          'number': 'blue',
          'boolean': 'yellow',
          'undefined': 'grey',
          'null': 'bold',
          'string': 'green',
          'date': 'magenta',
          // "name": intentionally not styling
          'regexp': 'red' }[styleType];

    if (style) {
      return '\u001b[' + styles[style][0] + 'm' + str +
             '\u001b[' + styles[style][1] + 'm';
    } else {
      return str;
    }
  };
  if (! colors) {
    stylize = function(str, styleType) { return str; };
  }

  function format(value, recurseTimes) {
    // Provide a hook for user-specified inspect functions.
    // Check that value is an object with an inspect function on it
    if (value && typeof value.inspect === 'function' &&
        // Filter out the util module, it's inspect function is special
        value !== exports &&
        // Also filter out any prototype objects using the circular check.
        !(value.constructor && value.constructor.prototype === value)) {
      return value.inspect(recurseTimes);
    }

    // Primitive types cannot have properties
    switch (typeof value) {
      case 'undefined':
        return stylize('undefined', 'undefined');

      case 'string':
        var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                                 .replace(/'/g, "\\'")
                                                 .replace(/\\"/g, '"') + '\'';
        return stylize(simple, 'string');

      case 'number':
        return stylize('' + value, 'number');

      case 'boolean':
        return stylize('' + value, 'boolean');
    }
    // For some reason typeof null is "object", so special case here.
    if (value === null) {
      return stylize('null', 'null');
    }

    // Look up the keys of the object.
    var visible_keys = Object_keys(value);
    var keys = showHidden ? Object_getOwnPropertyNames(value) : visible_keys;

    // Functions without properties can be shortcutted.
    if (typeof value === 'function' && keys.length === 0) {
      if (isRegExp(value)) {
        return stylize('' + value, 'regexp');
      } else {
        var name = value.name ? ': ' + value.name : '';
        return stylize('[Function' + name + ']', 'special');
      }
    }

    // Dates without properties can be shortcutted
    if (isDate(value) && keys.length === 0) {
      return stylize(value.toUTCString(), 'date');
    }

    var base, type, braces;
    // Determine the object type
    if (isArray(value)) {
      type = 'Array';
      braces = ['[', ']'];
    } else {
      type = 'Object';
      braces = ['{', '}'];
    }

    // Make functions say that they are functions
    if (typeof value === 'function') {
      var n = value.name ? ': ' + value.name : '';
      base = (isRegExp(value)) ? ' ' + value : ' [Function' + n + ']';
    } else {
      base = '';
    }

    // Make dates with properties first say the date
    if (isDate(value)) {
      base = ' ' + value.toUTCString();
    }

    if (keys.length === 0) {
      return braces[0] + base + braces[1];
    }

    if (recurseTimes < 0) {
      if (isRegExp(value)) {
        return stylize('' + value, 'regexp');
      } else {
        return stylize('[Object]', 'special');
      }
    }

    seen.push(value);

    var output = keys.map(function(key) {
      var name, str;
      if (value.__lookupGetter__) {
        if (value.__lookupGetter__(key)) {
          if (value.__lookupSetter__(key)) {
            str = stylize('[Getter/Setter]', 'special');
          } else {
            str = stylize('[Getter]', 'special');
          }
        } else {
          if (value.__lookupSetter__(key)) {
            str = stylize('[Setter]', 'special');
          }
        }
      }
      if (visible_keys.indexOf(key) < 0) {
        name = '[' + key + ']';
      }
      if (!str) {
        if (seen.indexOf(value[key]) < 0) {
          if (recurseTimes === null) {
            str = format(value[key]);
          } else {
            str = format(value[key], recurseTimes - 1);
          }
          if (str.indexOf('\n') > -1) {
            if (isArray(value)) {
              str = str.split('\n').map(function(line) {
                return '  ' + line;
              }).join('\n').substr(2);
            } else {
              str = '\n' + str.split('\n').map(function(line) {
                return '   ' + line;
              }).join('\n');
            }
          }
        } else {
          str = stylize('[Circular]', 'special');
        }
      }
      if (typeof name === 'undefined') {
        if (type === 'Array' && key.match(/^\d+$/)) {
          return str;
        }
        name = JSON.stringify('' + key);
        if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
          name = name.substr(1, name.length - 2);
          name = stylize(name, 'name');
        } else {
          name = name.replace(/'/g, "\\'")
                     .replace(/\\"/g, '"')
                     .replace(/(^"|"$)/g, "'");
          name = stylize(name, 'string');
        }
      }

      return name + ': ' + str;
    });

    seen.pop();

    var numLinesEst = 0;
    var length = output.reduce(function(prev, cur) {
      numLinesEst++;
      if (cur.indexOf('\n') >= 0) numLinesEst++;
      return prev + cur.length + 1;
    }, 0);

    if (length > 50) {
      output = braces[0] +
               (base === '' ? '' : base + '\n ') +
               ' ' +
               output.join(',\n  ') +
               ' ' +
               braces[1];

    } else {
      output = braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
    }

    return output;
  }
  return format(obj, (typeof depth === 'undefined' ? 2 : depth));
};


function isArray(ar) {
  return Array.isArray(ar) ||
         (typeof ar === 'object' && Object.prototype.toString.call(ar) === '[object Array]');
}


function isRegExp(re) {
  typeof re === 'object' && Object.prototype.toString.call(re) === '[object RegExp]';
}


function isDate(d) {
  return typeof d === 'object' && Object.prototype.toString.call(d) === '[object Date]';
}

function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}

var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}

exports.log = function (msg) {};

exports.pump = null;

var Object_keys = Object.keys || function (obj) {
    var res = [];
    for (var key in obj) res.push(key);
    return res;
};

var Object_getOwnPropertyNames = Object.getOwnPropertyNames || function (obj) {
    var res = [];
    for (var key in obj) {
        if (Object.hasOwnProperty.call(obj, key)) res.push(key);
    }
    return res;
};

var Object_create = Object.create || function (prototype, properties) {
    // from es5-shim
    var object;
    if (prototype === null) {
        object = { '__proto__' : null };
    }
    else {
        if (typeof prototype !== 'object') {
            throw new TypeError(
                'typeof prototype[' + (typeof prototype) + '] != \'object\''
            );
        }
        var Type = function () {};
        Type.prototype = prototype;
        object = new Type();
        object.__proto__ = prototype;
    }
    if (typeof properties !== 'undefined' && Object.defineProperties) {
        Object.defineProperties(object, properties);
    }
    return object;
};

exports.inherits = function(ctor, superCtor) {
  ctor.super_ = superCtor;
  ctor.prototype = Object_create(superCtor.prototype, {
    constructor: {
      value: ctor,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
};

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (typeof f !== 'string') {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(exports.inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j': return JSON.stringify(args[i++]);
      default:
        return x;
    }
  });
  for(var x = args[i]; i < len; x = args[++i]){
    if (x === null || typeof x !== 'object') {
      str += ' ' + x;
    } else {
      str += ' ' + exports.inspect(x);
    }
  }
  return str;
};

},{"events":12}],"./utils":[function(require,module,exports){
module.exports=require('+Nu4mz');
},{}],"./layout":[function(require,module,exports){
module.exports=require('B83s2m');
},{}],"./chord_diagram":[function(require,module,exports){
module.exports=require('EHWjuh');
},{}],23:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            if (ev.source === window && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],24:[function(require,module,exports){
//     Underscore.js 1.4.4
//     http://underscorejs.org
//     (c) 2009-2013 Jeremy Ashkenas, DocumentCloud Inc.
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `global` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var push             = ArrayProto.push,
      slice            = ArrayProto.slice,
      concat           = ArrayProto.concat,
      toString         = ObjProto.toString,
      hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object via a string identifier,
  // for Closure Compiler "advanced" mode.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.4.4';

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects with the built-in `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  var each = _.each = _.forEach = function(obj, iterator, context) {
    if (obj == null) return;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, l = obj.length; i < l; i++) {
        if (iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      for (var key in obj) {
        if (_.has(obj, key)) {
          if (iterator.call(context, obj[key], key, obj) === breaker) return;
        }
      }
    }
  };

  // Return the results of applying the iterator to each element.
  // Delegates to **ECMAScript 5**'s native `map` if available.
  _.map = _.collect = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function(value, index, list) {
      results[results.length] = iterator.call(context, value, index, list);
    });
    return results;
  };

  var reduceError = 'Reduce of empty array with no initial value';

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduce && obj.reduce === nativeReduce) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    each(obj, function(value, index, list) {
      if (!initial) {
        memo = value;
        initial = true;
      } else {
        memo = iterator.call(context, memo, value, index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
    }
    var length = obj.length;
    if (length !== +length) {
      var keys = _.keys(obj);
      length = keys.length;
    }
    each(obj, function(value, index, list) {
      index = keys ? keys[--length] : --length;
      if (!initial) {
        memo = obj[index];
        initial = true;
      } else {
        memo = iterator.call(context, memo, obj[index], index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, iterator, context) {
    var result;
    any(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Delegates to **ECMAScript 5**'s native `filter` if available.
  // Aliased as `select`.
  _.filter = _.select = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
    each(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, iterator, context) {
    return _.filter(obj, function(value, index, list) {
      return !iterator.call(context, value, index, list);
    }, context);
  };

  // Determine whether all of the elements match a truth test.
  // Delegates to **ECMAScript 5**'s native `every` if available.
  // Aliased as `all`.
  _.every = _.all = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = true;
    if (obj == null) return result;
    if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
    each(obj, function(value, index, list) {
      if (!(result = result && iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if at least one element in the object matches a truth test.
  // Delegates to **ECMAScript 5**'s native `some` if available.
  // Aliased as `any`.
  var any = _.some = _.any = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = false;
    if (obj == null) return result;
    if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
    each(obj, function(value, index, list) {
      if (result || (result = iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if the array or object contains a given value (using `===`).
  // Aliased as `include`.
  _.contains = _.include = function(obj, target) {
    if (obj == null) return false;
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    return any(obj, function(value) {
      return value === target;
    });
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      return (isFunc ? method : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, function(value){ return value[key]; });
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs, first) {
    if (_.isEmpty(attrs)) return first ? null : [];
    return _[first ? 'find' : 'filter'](obj, function(value) {
      for (var key in attrs) {
        if (attrs[key] !== value[key]) return false;
      }
      return true;
    });
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.where(obj, attrs, true);
  };

  // Return the maximum element or (element-based computation).
  // Can't optimize arrays of integers longer than 65,535 elements.
  // See: https://bugs.webkit.org/show_bug.cgi?id=80797
  _.max = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.max.apply(Math, obj);
    }
    if (!iterator && _.isEmpty(obj)) return -Infinity;
    var result = {computed : -Infinity, value: -Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed >= result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.min.apply(Math, obj);
    }
    if (!iterator && _.isEmpty(obj)) return Infinity;
    var result = {computed : Infinity, value: Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed < result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Shuffle an array.
  _.shuffle = function(obj) {
    var rand;
    var index = 0;
    var shuffled = [];
    each(obj, function(value) {
      rand = _.random(index++);
      shuffled[index - 1] = shuffled[rand];
      shuffled[rand] = value;
    });
    return shuffled;
  };

  // An internal function to generate lookup iterators.
  var lookupIterator = function(value) {
    return _.isFunction(value) ? value : function(obj){ return obj[value]; };
  };

  // Sort the object's values by a criterion produced by an iterator.
  _.sortBy = function(obj, value, context) {
    var iterator = lookupIterator(value);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value : value,
        index : index,
        criteria : iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index < right.index ? -1 : 1;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(obj, value, context, behavior) {
    var result = {};
    var iterator = lookupIterator(value || _.identity);
    each(obj, function(value, index) {
      var key = iterator.call(context, value, index, obj);
      behavior(result, key, value);
    });
    return result;
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = function(obj, value, context) {
    return group(obj, value, context, function(result, key, value) {
      (_.has(result, key) ? result[key] : (result[key] = [])).push(value);
    });
  };

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = function(obj, value, context) {
    return group(obj, value, context, function(result, key) {
      if (!_.has(result, key)) result[key] = 0;
      result[key]++;
    });
  };

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iterator, context) {
    iterator = iterator == null ? _.identity : lookupIterator(iterator);
    var value = iterator.call(context, obj);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >>> 1;
      iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;
    }
    return low;
  };

  // Safely convert anything iterable into a real, live array.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (obj.length === +obj.length) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return (obj.length === +obj.length) ? obj.length : _.keys(obj).length;
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    return (n != null) && !guard ? slice.call(array, 0, n) : array[0];
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if ((n != null) && !guard) {
      return slice.call(array, Math.max(array.length - n, 0));
    } else {
      return array[array.length - 1];
    }
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, (n == null) || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, output) {
    each(input, function(value) {
      if (_.isArray(value)) {
        shallow ? push.apply(output, value) : flatten(value, shallow, output);
      } else {
        output.push(value);
      }
    });
    return output;
  };

  // Return a completely flattened version of an array.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iterator, context) {
    if (_.isFunction(isSorted)) {
      context = iterator;
      iterator = isSorted;
      isSorted = false;
    }
    var initial = iterator ? _.map(array, iterator, context) : array;
    var results = [];
    var seen = [];
    each(initial, function(value, index) {
      if (isSorted ? (!index || seen[seen.length - 1] !== value) : !_.contains(seen, value)) {
        seen.push(value);
        results.push(array[index]);
      }
    });
    return results;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(concat.apply(ArrayProto, arguments));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var rest = slice.call(arguments, 1);
    return _.filter(_.uniq(array), function(item) {
      return _.every(rest, function(other) {
        return _.indexOf(other, item) >= 0;
      });
    });
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = concat.apply(ArrayProto, slice.call(arguments, 1));
    return _.filter(array, function(value){ return !_.contains(rest, value); });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    var args = slice.call(arguments);
    var length = _.max(_.pluck(args, 'length'));
    var results = new Array(length);
    for (var i = 0; i < length; i++) {
      results[i] = _.pluck(args, "" + i);
    }
    return results;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    if (list == null) return {};
    var result = {};
    for (var i = 0, l = list.length; i < l; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
  // we need this function. Return the position of the first occurrence of an
  // item in an array, or -1 if the item is not included in the array.
  // Delegates to **ECMAScript 5**'s native `indexOf` if available.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i = 0, l = array.length;
    if (isSorted) {
      if (typeof isSorted == 'number') {
        i = (isSorted < 0 ? Math.max(0, l + isSorted) : isSorted);
      } else {
        i = _.sortedIndex(array, item);
        return array[i] === item ? i : -1;
      }
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item, isSorted);
    for (; i < l; i++) if (array[i] === item) return i;
    return -1;
  };

  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
  _.lastIndexOf = function(array, item, from) {
    if (array == null) return -1;
    var hasIndex = from != null;
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) {
      return hasIndex ? array.lastIndexOf(item, from) : array.lastIndexOf(item);
    }
    var i = (hasIndex ? from : array.length);
    while (i--) if (array[i] === item) return i;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = arguments[2] || 1;

    var len = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(len);

    while(idx < len) {
      range[idx++] = start;
      start += step;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    if (func.bind === nativeBind && nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    var args = slice.call(arguments, 2);
    return function() {
      return func.apply(context, args.concat(slice.call(arguments)));
    };
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context.
  _.partial = function(func) {
    var args = slice.call(arguments, 1);
    return function() {
      return func.apply(this, args.concat(slice.call(arguments)));
    };
  };

  // Bind all of an object's methods to that object. Useful for ensuring that
  // all callbacks defined on an object belong to it.
  _.bindAll = function(obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length === 0) funcs = _.functions(obj);
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memo = {};
    hasher || (hasher = _.identity);
    return function() {
      var key = hasher.apply(this, arguments);
      return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
    };
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){ return func.apply(null, args); }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time.
  _.throttle = function(func, wait) {
    var context, args, timeout, result;
    var previous = 0;
    var later = function() {
      previous = new Date;
      timeout = null;
      result = func.apply(context, args);
    };
    return function() {
      var now = new Date;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0) {
        clearTimeout(timeout);
        timeout = null;
        previous = now;
        result = func.apply(context, args);
      } else if (!timeout) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, result;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) result = func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) result = func.apply(context, args);
      return result;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = function(func) {
    var ran = false, memo;
    return function() {
      if (ran) return memo;
      ran = true;
      memo = func.apply(this, arguments);
      func = null;
      return memo;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return function() {
      var args = [func];
      push.apply(args, arguments);
      return wrapper.apply(this, args);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var funcs = arguments;
    return function() {
      var args = arguments;
      for (var i = funcs.length - 1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    if (times <= 0) return func();
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = nativeKeys || function(obj) {
    if (obj !== Object(obj)) throw new TypeError('Invalid object');
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys[keys.length] = key;
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var values = [];
    for (var key in obj) if (_.has(obj, key)) values.push(obj[key]);
    return values;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var pairs = [];
    for (var key in obj) if (_.has(obj, key)) pairs.push([key, obj[key]]);
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    for (var key in obj) if (_.has(obj, key)) result[obj[key]] = key;
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    each(keys, function(key) {
      if (key in obj) copy[key] = obj[key];
    });
    return copy;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    for (var key in obj) {
      if (!_.contains(keys, key)) copy[key] = obj[key];
    }
    return copy;
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          if (obj[prop] == null) obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the Harmony `egal` proposal: http://wiki.ecmascript.org/doku.php?id=harmony:egal.
    if (a === b) return a !== 0 || 1 / a == 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className != toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, dates, and booleans are compared by value.
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return a == String(b);
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
        // other numeric values.
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a == +b;
      // RegExps are compared by their source patterns and flags.
      case '[object RegExp]':
        return a.source == b.source &&
               a.global == b.global &&
               a.multiline == b.multiline &&
               a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] == a) return bStack[length] == b;
    }
    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);
    var size = 0, result = true;
    // Recursively compare objects and arrays.
    if (className == '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size == b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          if (!(result = eq(a[size], b[size], aStack, bStack))) break;
        }
      }
    } else {
      // Objects with different constructors are not equivalent, but `Object`s
      // from different frames are.
      var aCtor = a.constructor, bCtor = b.constructor;
      if (aCtor !== bCtor && !(_.isFunction(aCtor) && (aCtor instanceof aCtor) &&
                               _.isFunction(bCtor) && (bCtor instanceof bCtor))) {
        return false;
      }
      // Deep compare objects.
      for (var key in a) {
        if (_.has(a, key)) {
          // Count the expected number of properties.
          size++;
          // Deep compare each member.
          if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
        }
      }
      // Ensure that both objects contain the same number of properties.
      if (result) {
        for (key in b) {
          if (_.has(b, key) && !(size--)) break;
        }
        result = !size;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return result;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, [], []);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) == '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    return obj === Object(obj);
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
  each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) == '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return !!(obj && _.has(obj, 'callee'));
    };
  }

  // Optimize `isFunction` if appropriate.
  if (typeof (/./) !== 'function') {
    _.isFunction = function(obj) {
      return typeof obj === 'function';
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj != +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iterators.
  _.identity = function(value) {
    return value;
  };

  // Run a function **n** times.
  _.times = function(n, iterator, context) {
    var accum = Array(n);
    for (var i = 0; i < n; i++) accum[i] = iterator.call(context, i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // List of HTML entities for escaping.
  var entityMap = {
    escape: {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;'
    }
  };
  entityMap.unescape = _.invert(entityMap.escape);

  // Regexes containing the keys and values listed immediately above.
  var entityRegexes = {
    escape:   new RegExp('[' + _.keys(entityMap.escape).join('') + ']', 'g'),
    unescape: new RegExp('(' + _.keys(entityMap.unescape).join('|') + ')', 'g')
  };

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  _.each(['escape', 'unescape'], function(method) {
    _[method] = function(string) {
      if (string == null) return '';
      return ('' + string).replace(entityRegexes[method], function(match) {
        return entityMap[method][match];
      });
    };
  });

  // If the value of the named property is a function then invoke it;
  // otherwise, return it.
  _.result = function(object, property) {
    if (object == null) return null;
    var value = object[property];
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    each(_.functions(obj), function(name){
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result.call(this, func.apply(_, args));
      };
    });
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\t':     't',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  _.template = function(text, data, settings) {
    var render;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = new RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset)
        .replace(escaper, function(match) { return '\\' + escapes[match]; });

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      }
      if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      }
      if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }
      index = offset + match.length;
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + "return __p;\n";

    try {
      render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    if (data) return render(data, _);
    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled function source as a convenience for precompilation.
    template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function, which will delegate to the wrapper.
  _.chain = function(obj) {
    return _(obj).chain();
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(obj) {
    return this._chain ? _(obj).chain() : obj;
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name == 'shift' || name == 'splice') && obj.length === 0) delete obj[0];
      return result.call(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result.call(this, method.apply(this._wrapped, arguments));
    };
  });

  _.extend(_.prototype, {

    // Start chaining a wrapped Underscore object.
    chain: function() {
      this._chain = true;
      return this;
    },

    // Extracts the result from a wrapped and chained object.
    value: function() {
      return this._wrapped;
    }

  });

}).call(this);

},{}],"./instruments":[function(require,module,exports){
module.exports=require('B8u3u9');
},{}],"./fingerings":[function(require,module,exports){
module.exports=require('/X1WgR');
},{}],"./pitch_diagram":[function(require,module,exports){
module.exports=require('e0n95g');
},{}]},{},[1,"QgR0mD","EHWjuh","/X1WgR","V9DGE2","NBDcvj","B8u3u9","B83s2m","e0n95g","80u6C5","+Nu4mz"])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvb3N0ZWVsZS9Db2RlL2ZyZXRib2FyZC9hcHAvanMvYXBwLmNvZmZlZSIsIi9Vc2Vycy9vc3RlZWxlL0NvZGUvZnJldGJvYXJkL2xpYi9icm93c2VyL2NhbnZhcy5jb2ZmZWUiLCIvVXNlcnMvb3N0ZWVsZS9Db2RlL2ZyZXRib2FyZC9saWIvY2hvcmRfZGlhZ3JhbS5jb2ZmZWUiLCIvVXNlcnMvb3N0ZWVsZS9Db2RlL2ZyZXRib2FyZC9saWIvZmluZ2VyaW5ncy5jb2ZmZWUiLCIvVXNlcnMvb3N0ZWVsZS9Db2RlL2ZyZXRib2FyZC9saWIvZnJldGJvYXJkX2RpYWdyYW0uY29mZmVlIiwiL1VzZXJzL29zdGVlbGUvQ29kZS9mcmV0Ym9hcmQvbGliL2hhcm1vbmljX3RhYmxlLmNvZmZlZSIsIi9Vc2Vycy9vc3RlZWxlL0NvZGUvZnJldGJvYXJkL2xpYi9pbnN0cnVtZW50cy5jb2ZmZWUiLCIvVXNlcnMvb3N0ZWVsZS9Db2RlL2ZyZXRib2FyZC9saWIvbGF5b3V0LmNvZmZlZSIsIi9Vc2Vycy9vc3RlZWxlL0NvZGUvZnJldGJvYXJkL2xpYi9waXRjaF9kaWFncmFtLmNvZmZlZSIsIi9Vc2Vycy9vc3RlZWxlL0NvZGUvZnJldGJvYXJkL2xpYi90aGVvcnkuY29mZmVlIiwiL1VzZXJzL29zdGVlbGUvQ29kZS9mcmV0Ym9hcmQvbGliL3V0aWxzLmNvZmZlZSIsIi9Vc2Vycy9vc3RlZWxlL0NvZGUvZnJldGJvYXJkL25vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLWJ1aWx0aW5zL2J1aWx0aW4vZXZlbnRzLmpzIiwiL1VzZXJzL29zdGVlbGUvQ29kZS9mcmV0Ym9hcmQvbm9kZV9tb2R1bGVzL2dydW50LWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItYnVpbHRpbnMvYnVpbHRpbi9mcy5qcyIsIi9Vc2Vycy9vc3RlZWxlL0NvZGUvZnJldGJvYXJkL25vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLWJ1aWx0aW5zL2J1aWx0aW4vcGF0aC5qcyIsIi9Vc2Vycy9vc3RlZWxlL0NvZGUvZnJldGJvYXJkL25vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLWJ1aWx0aW5zL2J1aWx0aW4vdXRpbC5qcyIsIi9Vc2Vycy9vc3RlZWxlL0NvZGUvZnJldGJvYXJkL25vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9pbnNlcnQtbW9kdWxlLWdsb2JhbHMvbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsIi9Vc2Vycy9vc3RlZWxlL0NvZGUvZnJldGJvYXJkL25vZGVfbW9kdWxlcy91bmRlcnNjb3JlL3VuZGVyc2NvcmUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUlBLElBQUEsdUZBQUE7O0FBQUEsQ0FBQSxFQUFlLElBQUEsS0FBZixLQUFlOztBQUNmLENBREEsRUFDUyxHQUFULENBQVMsR0FBQTs7QUFDVCxDQUZBLEVBRWMsSUFBQSxJQUFkLElBQWM7O0FBQ2IsQ0FIRCxFQUdvQixJQUFBLE9BQUEsQ0FIcEI7O0FBS0EsQ0FMQSxDQU1FLEdBREYsQ0FBQSxDQUtJLEdBQUE7O0FBUUosQ0FsQkEsRUFrQmdDLEVBQWhDLEVBQU8sQ0FBUCxDQUFnQztDQUN0QixDQUFvQixLQUFyQixDQUFQLENBQUEsS0FBNEI7Q0FERTs7QUFHaEMsQ0FyQkEsSUFxQkE7Q0FBUSxDQUFBLENBQVMsRUFBQSxFQUFULEVBQVU7Q0FBYSxDQUFELEdBQUYsQ0FBQSxDQUFBLElBQUE7Q0FBcEIsRUFBUztDQXJCakIsQ0FxQkE7O0FBT0EsQ0E1QkEsQ0E0QnFD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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsTUE7QUFDQTs7Ozs7Ozs7OztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7QUN6VkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiI1xuIyBJbXBvcnRzXG4jXG5cbkNob3JkRGlhZ3JhbSA9IHJlcXVpcmUgJy4vY2hvcmRfZGlhZ3JhbSdcbkxheW91dCA9IHJlcXVpcmUgJy4vbGF5b3V0J1xuSW5zdHJ1bWVudHMgPSByZXF1aXJlICcuL2luc3RydW1lbnRzJ1xue2Nob3JkRmluZ2VyaW5nc30gPSByZXF1aXJlICcuL2ZpbmdlcmluZ3MnXG5cbntcbiAgQ2hvcmRcbiAgQ2hvcmRzXG4gIFNjYWxlXG4gIFNjYWxlc1xufSA9IHJlcXVpcmUoJy4vdGhlb3J5JylcblxuXG4jXG4jIEV4dGVuc2lvbnNcbiNcblxuIyByZXF1aXJlanMgbmVjZXNzaXRhdGVzIHRoaXNcbmFuZ3VsYXIuZWxlbWVudChkb2N1bWVudCkucmVhZHkgLT5cbiAgYW5ndWxhci5ib290c3RyYXAoZG9jdW1lbnQsIFsnRnJldGJvYXJkQXBwJ10pXG5cbl8ubWl4aW4gcmV2ZXJzZTogKGFycmF5KSAtPiBbXS5jb25jYXQoYXJyYXkpLnJldmVyc2UoKVxuXG5cbiNcbiMgQXBwbGljYXRpb25cbiNcblxuYXBwID0gYW5ndWxhci5tb2R1bGUgJ0ZyZXRib2FyZEFwcCcsIFsnbmdBbmltYXRlJywgJ25nUm91dGUnLCAnbmdTYW5pdGl6ZSddXG5cbmFwcC5jb25maWcgKCRsb2NhdGlvblByb3ZpZGVyLCAkcm91dGVQcm92aWRlcikgLT5cbiAgJHJvdXRlUHJvdmlkZXJcbiAgICAud2hlbignLycsIGNvbnRyb2xsZXI6ICdDaG9yZFRhYmxlQ3RybCcsIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL2Nob3JkLXRhYmxlLmh0bWwnKVxuICAgIC53aGVuKCcvY2hvcmQvOmNob3JkTmFtZScsIGNvbnRyb2xsZXI6ICdDaG9yZERldGFpbHNDdHJsJywgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvY2hvcmQtZGV0YWlscy5odG1sJylcbiAgICAub3RoZXJ3aXNlKHJlZGlyZWN0VG86ICcvJylcblxuXG4jXG4jIENob3JkIFRhYmxlXG4jXG5cbmFwcC5jb250cm9sbGVyICdDaG9yZFRhYmxlQ3RybCcsICgkc2NvcGUpIC0+XG4gICRzY29wZS50b25pY3MgPSBbJ0MnLCAnRCcsICdFJywgJ0YnLCAnRycsICdBJywgJ0InXVxuXG4gICRzY29wZS5nZXRTY2FsZUNob3JkcyA9IGRvIC0+XG4gICAgIyBUaGUgY2FjaGUgaXMgbmVjZXNzYXJ5IHRvIHByZXZlbnQgYSBkaWdlc3QgaXRlcmF0aW9uIGVycm9yXG4gICAgY2FjaGUgPSB7fVxuICAgIChzY2FsZU5hbWUsIHNldmVudGhzKSAtPlxuICAgICAgY2FjaGVbW3NjYWxlTmFtZSwgc2V2ZW50aHNdXSBvcj0gU2NhbGUuZmluZChzY2FsZU5hbWUpLmNob3JkcyhzZXZlbnRoczogc2V2ZW50aHMpXG5cblxuI1xuIyBDaG9yZCBEZXRhaWxzXG4jXG5cbmFwcC5jb250cm9sbGVyICdDaG9yZERldGFpbHNDdHJsJywgKCRzY29wZSwgJHJvdXRlUGFyYW1zKSAtPlxuICBjaG9yZE5hbWUgPSAkcm91dGVQYXJhbXMuY2hvcmROYW1lLnJlcGxhY2UoJyYjOTgzOTsnLCAnIycpXG4gICRzY29wZS5jaG9yZCA9IENob3JkLmZpbmQoY2hvcmROYW1lKVxuICAkc2NvcGUuaW5zdHJ1bWVudCA9IEluc3RydW1lbnRzLkRlZmF1bHRcbiAgJHNjb3BlLmZpbmdlcmluZ3MgPSBjaG9yZEZpbmdlcmluZ3MoJHNjb3BlLmNob3JkLCAkc2NvcGUuaW5zdHJ1bWVudCwgYWxsUG9zaXRpb25zOiB0cnVlKVxuXG4gICNcbiAgIyBMYWJlbHNcbiAgI1xuXG4gIGZvciBmaW5nZXJpbmcgaW4gJHNjb3BlLmZpbmdlcmluZ3NcbiAgICBsYWJlbHMgPSBbXVxuICAgIHNvcnRLZXlzID0ge31cbiAgICBmb3IgbmFtZSwgYmFkZ2Ugb2YgZmluZ2VyaW5nLnByb3BlcnRpZXNcbiAgICAgIGJhZGdlID0gbnVsbCBpZiBiYWRnZSA9PSB0cnVlXG4gICAgICBsYWJlbHMucHVzaCB7bmFtZSwgYmFkZ2V9XG4gICAgICBzb3J0S2V5c1tuYW1lXSA9IGJhZGdlXG4gICAgZmluZ2VyaW5nLmxhYmVscyA9IGxhYmVscy5zb3J0KClcbiAgICBmaW5nZXJpbmcuc29ydEtleXMgPSBzb3J0S2V5c1xuXG4gICNcbiAgIyBTb3J0aW5nXG4gICNcblxuICAkc2NvcGUua2V5cyA9IF8uY2hhaW4oJHNjb3BlLmZpbmdlcmluZ3MpLnBsdWNrKCdwcm9wZXJ0aWVzJykubWFwKF8ua2V5cykuZmxhdHRlbigpLnVuaXEoKS52YWx1ZSgpXG4gICRzY29wZS5zb3J0S2V5ID0gJydcblxuICAkc2NvcGUub3JkZXJCeSA9IChzb3J0S2V5KSAtPlxuICAgICRzY29wZS5zb3J0S2V5ID0gc29ydEtleVxuICAgICQoJyN2b2ljaW5ncycpLmlzb3RvcGUoc29ydEJ5OiBzb3J0S2V5KVxuICAgICMgdmFsdWVzID0gXy5jb21wYWN0KGZpbmdlcmluZ3MubWFwIChmKSAtPiBmLnByb3BlcnRpZXNbc29ydEtleV0pXG4gICAgZmluZ2VyaW5ncyA9ICRzY29wZS5maW5nZXJpbmdzXG4gICAgZm9yIGZpbmdlcmluZyBpbiBmaW5nZXJpbmdzXG4gICAgICBsYWJlbHMgPSBmaW5nZXJpbmcubGFiZWxzLmZpbHRlciAobGFiZWwpIC0+IGxhYmVsLm5hbWUgPT0gc29ydEtleVxuICAgICAgZmluZ2VyaW5nLmxhYmVscyA9IGxhYmVscy5jb25jYXQoXy5kaWZmZXJlbmNlKGZpbmdlcmluZy5sYWJlbHMsIGxhYmVscykpIGlmIGxhYmVscy5sZW5ndGhcblxuXG4jXG4jIERpcmVjdGl2ZXNcbiNcblxuYXBwLmRpcmVjdGl2ZSAnaXNvdG9wZUNvbnRhaW5lcicsIC0+XG4gIHJlc3RyaWN0OiAnQ0FFJ1xuICBsaW5rOlxuICAgIHBvc3Q6IChzY29wZSwgZWxlbWVudCwgYXR0cnMpIC0+XG4gICAgICBzb3J0RGF0YSA9IHt9XG4gICAgICBzY29wZS5rZXlzLm1hcCAoa2V5KSAtPlxuICAgICAgICBzb3J0RGF0YVtrZXldID0gKCRlbGVtKSAtPlxuICAgICAgICAgICAgcmV0dXJuIGFuZ3VsYXIuZWxlbWVudCgkZWxlbSkuc2NvcGUoKS5maW5nZXJpbmcuc29ydEtleXNba2V5XSBvciAwXG4gICAgICAkKGVsZW1lbnQpLmlzb3RvcGVcbiAgICAgICAgYW5pbWF0aW9uRW5naW5lU3RyaW5nOiAnY3NzJ1xuICAgICAgICBpdGVtU2VsZWN0b3I6ICdbaXNvdG9wZS1pdGVtXSdcbiAgICAgICAgbGF5b3V0TW9kZTogJ2ZpdFJvd3MnXG4gICAgICAgIGdldFNvcnREYXRhOiBzb3J0RGF0YVxuXG5hcHAuZGlyZWN0aXZlICdpc290b3BlSXRlbScsICgkdGltZW91dCkgLT5cbiAgcmVzdHJpY3Q6ICdBRSdcbiAgbGluazogKHNjb3BlLCBlbGVtZW50LCBhdHRycykgLT5cbiAgICByZXR1cm4gdW5sZXNzIHNjb3BlLiRsYXN0XG4gICAgJGVsZW1lbnQgPSAkKGVsZW1lbnQpXG4gICAgZWxlbWVudC5yZWFkeSAtPlxuICAgICAgJGNvbnRhaW5lciA9ICRlbGVtZW50LnBhcmVudCgnLmlzb3RvcGUnKVxuICAgICAgJGNvbnRhaW5lci5pc290b3BlKCdyZWxvYWRJdGVtcycpLmlzb3RvcGUoc29ydEJ5OiAnYmFycmVzJykuY3NzKCd2aXNpYmlsaXR5JywgJ2luaGVyaXQnKVxuXG5hcHAuZGlyZWN0aXZlICdjaG9yZCcsIC0+XG4gIHJlc3RyaWN0OiAnQ0UnXG4gIHJlcGxhY2U6IHRydWVcbiAgdGVtcGxhdGU6IC0+XG4gICAgaW5zdHJ1bWVudCA9IEluc3RydW1lbnRzLkRlZmF1bHRcbiAgICBkaW1lbnNpb25zID0ge3dpZHRoOiBDaG9yZERpYWdyYW0ud2lkdGgoaW5zdHJ1bWVudCksIGhlaWdodDogQ2hvcmREaWFncmFtLmhlaWdodChpbnN0cnVtZW50KX1cbiAgICBcIjxkaXY+PHNwYW4gY2xhc3M9J2ZyZXROdW1iZXInIG5nOnNob3c9J3RvcEZyZXROdW1iZXInPnt7dG9wRnJldE51bWJlcn19PC9zcGFuPlwiICtcbiAgICAgIFwiPGNhbnZhcyB3aWR0aD0nI3tkaW1lbnNpb25zLndpZHRofScgaGVpZ2h0PScje2RpbWVuc2lvbnMuaGVpZ2h0fScvPjwvZGl2PlwiXG4gIHNjb3BlOiB7Y2hvcmQ6ICc9JywgZmluZ2VyaW5nOiAnPT8nfVxuICBsaW5rOiAoc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSAtPlxuICAgIGNhbnZhcyA9IGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignY2FudmFzJylcbiAgICBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKVxuICAgIGluc3RydW1lbnQgPSBJbnN0cnVtZW50cy5EZWZhdWx0XG4gICAgZG8gLT5cbiAgICAgIHtjaG9yZCwgZmluZ2VyaW5nfSA9IHNjb3BlXG4gICAgICBmaW5nZXJpbmdzID0gY2hvcmRGaW5nZXJpbmdzKGNob3JkLCBpbnN0cnVtZW50KVxuICAgICAgZmluZ2VyaW5nIG9yPSBmaW5nZXJpbmdzWzBdXG4gICAgICByZXR1cm4gdW5sZXNzIGZpbmdlcmluZ1xuICAgICAgY3R4LmNsZWFyUmVjdCAwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHRcbiAgICAgIHt0b3BGcmV0fSA9IENob3JkRGlhZ3JhbS5kcmF3IGN0eCwgaW5zdHJ1bWVudCwgZmluZ2VyaW5nLnBvc2l0aW9ucywgYmFycmVzOiBmaW5nZXJpbmcuYmFycmVzXG4gICAgICBzY29wZS50b3BGcmV0TnVtYmVyID0gdG9wRnJldCBpZiB0b3BGcmV0ID4gMFxuXG5hcHAuZmlsdGVyICdyYWlzZUFjY2lkZW50YWxzJywgLT5cbiAgKG5hbWUpIC0+XG4gICAgbmFtZS5yZXBsYWNlKC8oW+KZr+KZrV0pLywgJzxzdXA+JDE8L3N1cD4nKVxuIiwiXG4iLCJfID0gcmVxdWlyZSAndW5kZXJzY29yZSdcblxue1xuICBGcmV0Q291bnRcbiAgRnJldE51bWJlcnNcbn0gPSByZXF1aXJlICcuL2luc3RydW1lbnRzJ1xuTGF5b3V0ID0gcmVxdWlyZSAnLi9sYXlvdXQnXG5cbiNcbiMgU3R5bGVcbiNcblxue2hzdjJjc3N9ID0gcmVxdWlyZSAnLi91dGlscydcblxuU21hbGxTdHlsZSA9XG4gIGhfZ3V0dGVyOiA1XG4gIHZfZ3V0dGVyOiA1XG4gIHN0cmluZ19zcGFjaW5nOiA2XG4gIGZyZXRfaGVpZ2h0OiA4XG4gIGFib3ZlX2ZyZXRib2FyZDogOFxuICBub3RlX3JhZGl1czogMVxuICBjbG9zZWRfc3RyaW5nX2ZvbnRzaXplOiA0XG4gIGNob3JkX2RlZ3JlZV9jb2xvcnM6IFsncmVkJywgJ2JsdWUnLCAnZ3JlZW4nLCAnb3JhbmdlJ11cbiAgaW50ZXJ2YWxDbGFzc19jb2xvcnM6IFswLi4uMTJdLm1hcCAobikgLT5cbiAgICAjIGkgPSAoNyAqIG4pICUgMTIgICMgY29sb3IgYnkgY2lyY2xlIG9mIGZpZnRoIGFzY2Vuc2lvblxuICAgIGhzdjJjc3MgaDogbiAqIDM2MCAvIDEyLCBzOiAxLCB2OiAxXG5cbkRlZmF1bHRTdHlsZSA9IF8uZXh0ZW5kIHt9LCBTbWFsbFN0eWxlLFxuICBzdHJpbmdfc3BhY2luZzogMTJcbiAgZnJldF9oZWlnaHQ6IDE2XG4gIG5vdGVfcmFkaXVzOiAzXG4gIGNsb3NlZF9zdHJpbmdfZm9udHNpemU6IDhcblxuY29tcHV0ZUNob3JkRGlhZ3JhbURpbWVuc2lvbnMgPSAoaW5zdHJ1bWVudCwgc3R5bGU9RGVmYXVsdFN0eWxlKSAtPlxuICB7XG4gICAgd2lkdGg6IDIgKiBzdHlsZS5oX2d1dHRlciArIChpbnN0cnVtZW50LnN0cmluZ3MgLSAxKSAqIHN0eWxlLnN0cmluZ19zcGFjaW5nXG4gICAgaGVpZ2h0OiAyICogc3R5bGUudl9ndXR0ZXIgKyAoc3R5bGUuZnJldF9oZWlnaHQgKyAyKSAqIEZyZXRDb3VudFxuICB9XG5cblxuI1xuIyBEcmF3aW5nIE1ldGhvZHNcbiNcblxuZHJhd0Nob3JkRGlhZ3JhbVN0cmluZ3MgPSAoY3R4LCBpbnN0cnVtZW50LCBvcHRpb25zPXt9KSAtPlxuICBzdHlsZSA9IERlZmF1bHRTdHlsZVxuICBmb3Igc3RyaW5nIGluIGluc3RydW1lbnQuc3RyaW5nTnVtYmVyc1xuICAgIHggPSBzdHJpbmcgKiBzdHlsZS5zdHJpbmdfc3BhY2luZyArIHN0eWxlLmhfZ3V0dGVyXG4gICAgY3R4LmJlZ2luUGF0aCgpXG4gICAgY3R4Lm1vdmVUbyB4LCBzdHlsZS52X2d1dHRlciArIHN0eWxlLmFib3ZlX2ZyZXRib2FyZFxuICAgIGN0eC5saW5lVG8geCwgc3R5bGUudl9ndXR0ZXIgKyBzdHlsZS5hYm92ZV9mcmV0Ym9hcmQgKyBGcmV0Q291bnQgKiBzdHlsZS5mcmV0X2hlaWdodFxuICAgIGN0eC5zdHJva2VTdHlsZSA9IChpZiBvcHRpb25zLmRpbVN0cmluZ3MgYW5kIHN0cmluZyBpbiBvcHRpb25zLmRpbVN0cmluZ3MgdGhlbiAncmdiYSgwLDAsMCwwLjIpJyBlbHNlICdibGFjaycpXG4gICAgY3R4LnN0cm9rZSgpXG5cbmRyYXdDaG9yZERpYWdyYW1GcmV0cyA9IChjdHgsIGluc3RydW1lbnQsIHtkcmF3TnV0fT17ZHJhd051dDogdHJ1ZX0pIC0+XG4gIHN0eWxlID0gRGVmYXVsdFN0eWxlXG4gIGN0eC5zdHJva2VTdHlsZSA9ICdibGFjaydcbiAgZm9yIGZyZXQgaW4gRnJldE51bWJlcnNcbiAgICB5ID0gc3R5bGUudl9ndXR0ZXIgKyBzdHlsZS5hYm92ZV9mcmV0Ym9hcmQgKyBmcmV0ICogc3R5bGUuZnJldF9oZWlnaHRcbiAgICBjdHguYmVnaW5QYXRoKClcbiAgICBjdHgubW92ZVRvIHN0eWxlLnZfZ3V0dGVyIC0gMC41LCB5XG4gICAgY3R4LmxpbmVUbyBzdHlsZS52X2d1dHRlciArIDAuNSArIChpbnN0cnVtZW50LnN0cmluZ3MgLSAxKSAqIHN0eWxlLnN0cmluZ19zcGFjaW5nLCB5XG4gICAgY3R4LmxpbmVXaWR0aCA9IDMgaWYgZnJldCA9PSAwIGFuZCBkcmF3TnV0XG4gICAgY3R4LnN0cm9rZSgpXG4gICAgY3R4LmxpbmVXaWR0aCA9IDFcblxuZHJhd0Nob3JkRGlhZ3JhbSA9IChjdHgsIGluc3RydW1lbnQsIHBvc2l0aW9ucywgb3B0aW9ucz17fSkgLT5cbiAgZGVmYXVsdHMgPSB7ZHJhd0Nsb3NlZFN0cmluZ3M6IHRydWUsIGRyYXdOdXQ6IHRydWUsIGR5OiAwLCBzdHlsZTogRGVmYXVsdFN0eWxlfVxuICBvcHRpb25zID0gXy5leHRlbmQgZGVmYXVsdHMsIG9wdGlvbnNcbiAge2JhcnJlcywgZHksIGRyYXdDbG9zZWRTdHJpbmdzLCBkcmF3TnV0LCBzdHlsZX0gPSBvcHRpb25zXG5cbiAgdG9wRnJldCA9IDBcbiAgZnJldHMgPSAoZnJldCBmb3Ige2ZyZXR9IGluIHBvc2l0aW9ucyB3aGVuIGZyZXQgIT0gMClcbiAgbG93ZXN0RnJldCA9IE1hdGgubWluKGZyZXRzLi4uKVxuICBoaWdoZXN0RnJldCA9IE1hdGgubWF4KGZyZXRzLi4uKVxuICBpZiBoaWdoZXN0RnJldCA+IDRcbiAgICB0b3BGcmV0ID0gbG93ZXN0RnJldCAtIDFcbiAgICBkcmF3TnV0ID0gZmFsc2VcblxuICBpZiBvcHRpb25zLmRpbVVudXNlZFN0cmluZ3NcbiAgICB1c2VkU3RyaW5ncyA9IChzdHJpbmcgZm9yIHtzdHJpbmd9IGluIHBvc2l0aW9ucylcbiAgICBvcHRpb25zLmRpbVN0cmluZ3MgPSAoc3RyaW5nIGZvciBzdHJpbmcgaW4gaW5zdHJ1bWVudC5zdHJpbmdOdW1iZXJzIHdoZW4gc3RyaW5nIG5vdCBpbiB1c2VkU3RyaW5ncylcblxuICBmaW5nZXJDb29yZGluYXRlcyA9ICh7c3RyaW5nLCBmcmV0fSkgLT5cbiAgICBmcmV0IC09IHRvcEZyZXQgaWYgZnJldCA+IDBcbiAgICByZXR1cm4ge1xuICAgICAgeDogc3R5bGUuaF9ndXR0ZXIgKyBzdHJpbmcgKiBzdHlsZS5zdHJpbmdfc3BhY2luZyxcbiAgICAgIHk6IHN0eWxlLnZfZ3V0dGVyICsgc3R5bGUuYWJvdmVfZnJldGJvYXJkICsgKGZyZXQgLSAwLjUpICogc3R5bGUuZnJldF9oZWlnaHQgKyBkeVxuICAgIH1cblxuICBkcmF3RmluZ2VyUG9zaXRpb24gPSAocG9zaXRpb24sIG9wdGlvbnM9e30pIC0+XG4gICAge2lzUm9vdCwgY29sb3J9ID0gb3B0aW9uc1xuICAgIHt4LCB5fSA9IGZpbmdlckNvb3JkaW5hdGVzKHBvc2l0aW9uKVxuICAgIGN0eC5maWxsU3R5bGUgPSBjb2xvciBvciAoaWYgaXNSb290IHRoZW4gJ3JlZCcgZWxzZSAnd2hpdGUnKVxuICAgIGN0eC5zdHJva2VTdHlsZSA9IGNvbG9yIG9yIChpZiBpc1Jvb3QgdGhlbiAncmVkJyBlbHNlICdibGFjaycpXG4gICAgY3R4LmxpbmVXaWR0aCA9IDFcbiAgICBjdHguYmVnaW5QYXRoKClcbiAgICBpZiBpc1Jvb3QgYW5kIHBvc2l0aW9uLmZyZXRcbiAgICAgIGRvIChyPXN0eWxlLm5vdGVfcmFkaXVzKSAtPlxuICAgICAgICBjdHgucmVjdCB4IC0gciwgeSAtIHIsIDIgKiByLCAyICogclxuICAgIGVsc2VcbiAgICAgIGN0eC5hcmMgeCwgeSwgc3R5bGUubm90ZV9yYWRpdXMsIDAsIE1hdGguUEkgKiAyLCBmYWxzZVxuICAgIGN0eC5maWxsKCkgaWYgcG9zaXRpb24uZnJldCA+IDAgb3IgaXNSb290XG4gICAgY3R4LnN0cm9rZSgpXG5cbiAgZHJhd0JhcnJlcyA9IC0+XG4gICAgY3R4LmZpbGxTdHlsZSA9ICdibGFjaydcbiAgICBmb3Ige2ZyZXQsIGZpcnN0U3RyaW5nLCBzdHJpbmdDb3VudH0gaW4gYmFycmVzXG4gICAgICB7eDogeDEsIHl9ID0gZmluZ2VyQ29vcmRpbmF0ZXMge3N0cmluZzogZmlyc3RTdHJpbmcsIGZyZXR9XG4gICAgICB7eDogeDJ9ID0gZmluZ2VyQ29vcmRpbmF0ZXMge3N0cmluZzogZmlyc3RTdHJpbmcgKyBzdHJpbmdDb3VudCAtIDEsIGZyZXR9XG4gICAgICB3ID0geDIgLSB4MVxuICAgICAgY3R4LnNhdmUoKVxuICAgICAgY3R4LnRyYW5zbGF0ZSAoeDEgKyB4MikgLyAyLCB5IC0gc3R5bGUuZnJldF9oZWlnaHQgKiAuMjVcbiAgICAgIGN0eC5iZWdpblBhdGgoKVxuICAgICAgZWNjZW50cmljaXR5ID0gMTBcbiAgICAgIGRvIC0+XG4gICAgICAgIGN0eC5zYXZlKClcbiAgICAgICAgY3R4LnNjYWxlIHcsIGVjY2VudHJpY2l0eVxuICAgICAgICBjdHguYXJjIDAsIDAsIHN0eWxlLnN0cmluZ19zcGFjaW5nIC8gMiAvIGVjY2VudHJpY2l0eSwgTWF0aC5QSSwgMCwgZmFsc2VcbiAgICAgICAgY3R4LnJlc3RvcmUoKVxuICAgICAgZG8gLT5cbiAgICAgICAgY3R4LnNhdmUoKVxuICAgICAgICBjdHguc2NhbGUgdywgMTRcbiAgICAgICAgY3R4LmFyYyAwLCAwLCBzdHlsZS5zdHJpbmdfc3BhY2luZyAvIDIgLyBlY2NlbnRyaWNpdHksIDAsIE1hdGguUEksIHRydWVcbiAgICAgICAgY3R4LnJlc3RvcmUoKVxuICAgICAgY3R4LmZpbGwoKVxuICAgICAgY3R4LnJlc3RvcmUoKVxuICAgICAgIyBjdHguZmlsbFN0eWxlID0gJ3JnYmEoMCwwLDAsIDAuNSknXG4gICAgICAjIGN0eC5iZWdpblBhdGgoKVxuICAgICAgIyBjdHguYXJjIHgxLCB5LCBzdHlsZS5zdHJpbmdfc3BhY2luZyAvIDIsIE1hdGguUEkgKiAxLzIsIE1hdGguUEkgKiAzLzIsIGZhbHNlXG4gICAgICAjIGN0eC5hcmMgeDIsIHksIHN0eWxlLnN0cmluZ19zcGFjaW5nIC8gMiwgTWF0aC5QSSAqIDMvMiwgTWF0aC5QSSAqIDEvMiwgZmFsc2VcbiAgICAgICMgY3R4LmZpbGwoKVxuXG4gIGRyYXdGaW5nZXJQb3NpdGlvbnMgPSAtPlxuICAgIGZvciBwb3NpdGlvbiBpbiBwb3NpdGlvbnNcbiAgICAgIGRlZmF1bHRfb3B0aW9ucyA9XG4gICAgICAgIGNvbG9yOiBzdHlsZS5pbnRlcnZhbENsYXNzX2NvbG9yc1twb3NpdGlvbi5pbnRlcnZhbENsYXNzXVxuICAgICAgICBpc1Jvb3Q6IChwb3NpdGlvbi5pbnRlcnZhbENsYXNzID09IDApXG4gICAgICBkcmF3RmluZ2VyUG9zaXRpb24gcG9zaXRpb24sIF8uZXh0ZW5kKGRlZmF1bHRfb3B0aW9ucywgcG9zaXRpb24pXG5cbiAgZHJhd0Nsb3NlZFN0cmluZ3MgPSAtPlxuICAgIGZyZXR0ZWRfc3RyaW5ncyA9IFtdXG4gICAgZnJldHRlZF9zdHJpbmdzW3Bvc2l0aW9uLnN0cmluZ10gPSB0cnVlIGZvciBwb3NpdGlvbiBpbiBwb3NpdGlvbnNcbiAgICBjbG9zZWRfc3RyaW5ncyA9IChzdHJpbmcgZm9yIHN0cmluZyBpbiBpbnN0cnVtZW50LnN0cmluZ051bWJlcnMgd2hlbiBub3QgZnJldHRlZF9zdHJpbmdzW3N0cmluZ10pXG4gICAgciA9IHN0eWxlLm5vdGVfcmFkaXVzXG4gICAgY3R4LmZpbGxTdHlsZSA9ICdibGFjaydcbiAgICBmb3Igc3RyaW5nIGluIGNsb3NlZF9zdHJpbmdzXG4gICAgICB7eCwgeX0gPSBmaW5nZXJDb29yZGluYXRlcyB7c3RyaW5nLCBmcmV0OiAwfVxuICAgICAgY3R4LnN0cm9rZVN0eWxlID0gJ2JsYWNrJ1xuICAgICAgY3R4LmJlZ2luUGF0aCgpXG4gICAgICBjdHgubW92ZVRvIHggLSByLCB5IC0gclxuICAgICAgY3R4LmxpbmVUbyB4ICsgciwgeSArIHJcbiAgICAgIGN0eC5tb3ZlVG8geCAtIHIsIHkgKyByXG4gICAgICBjdHgubGluZVRvIHggKyByLCB5IC0gclxuICAgICAgY3R4LnN0cm9rZSgpXG5cbiAgZHJhd0Nob3JkRGlhZ3JhbVN0cmluZ3MgY3R4LCBpbnN0cnVtZW50LCBvcHRpb25zXG4gIGRyYXdDaG9yZERpYWdyYW1GcmV0cyBjdHgsIGluc3RydW1lbnQsIGRyYXdOdXQ6IGRyYXdOdXRcbiAgZHJhd0JhcnJlcygpIGlmIGJhcnJlc1xuICBkcmF3RmluZ2VyUG9zaXRpb25zKCkgaWYgcG9zaXRpb25zXG4gIGRyYXdDbG9zZWRTdHJpbmdzKCkgaWYgcG9zaXRpb25zIGFuZCBvcHRpb25zLmRyYXdDbG9zZWRTdHJpbmdzXG4gIHJldHVybiB7dG9wRnJldH1cblxuZHJhd0Nob3JkQmxvY2sgPSAoaW5zdHJ1bWVudCwgcG9zaXRpb25zLCBvcHRpb25zKSAtPlxuICBkaW1lbnNpb25zID0gY29tcHV0ZUNob3JkRGlhZ3JhbURpbWVuc2lvbnMoaW5zdHJ1bWVudClcbiAgTGF5b3V0LmJsb2NrXG4gICAgd2lkdGg6IGRpbWVuc2lvbnMud2lkdGhcbiAgICBoZWlnaHQ6IGRpbWVuc2lvbnMuaGVpZ2h0XG4gICAgZHJhdzogKCkgLT5cbiAgICAgIExheW91dC53aXRoR3JhcGhpY3NDb250ZXh0IChjdHgpIC0+XG4gICAgICAgIGN0eC50cmFuc2xhdGUgMCwgLWRpbWVuc2lvbnMuaGVpZ2h0XG4gICAgICAgIGRyYXdDaG9yZERpYWdyYW0gY3R4LCBpbnN0cnVtZW50LCBwb3NpdGlvbnMsIG9wdGlvbnNcblxubW9kdWxlLmV4cG9ydHMgPVxuICBkZWZhdWx0U3R5bGU6IERlZmF1bHRTdHlsZVxuICB3aWR0aDogKGluc3RydW1lbnQpIC0+IGNvbXB1dGVDaG9yZERpYWdyYW1EaW1lbnNpb25zKGluc3RydW1lbnQpLndpZHRoXG4gIGhlaWdodDogKGluc3RydW1lbnQpIC0+IGNvbXB1dGVDaG9yZERpYWdyYW1EaW1lbnNpb25zKGluc3RydW1lbnQpLmhlaWdodFxuICBkcmF3OiBkcmF3Q2hvcmREaWFncmFtXG4gIGJsb2NrOiBkcmF3Q2hvcmRCbG9ja1xuIiwidXRpbCA9IHJlcXVpcmUgJ3V0aWwnXG5fID0gcmVxdWlyZSAndW5kZXJzY29yZSdcbntnZXRQaXRjaENsYXNzTmFtZSwgaW50ZXJ2YWxDbGFzc0RpZmZlcmVuY2V9ID0gcmVxdWlyZSAnLi90aGVvcnknXG5JbnN0cnVtZW50cyA9IHJlcXVpcmUgJy4vaW5zdHJ1bWVudHMnXG5cbntcbiAgRnJldE51bWJlcnNcbiAgZnJldGJvYXJkUG9zaXRpb25zRWFjaFxuICBwaXRjaE51bWJlckZvclBvc2l0aW9uXG59ID0gSW5zdHJ1bWVudHNcblxucmVxdWlyZSAnLi91dGlscydcblxuIyBUaGVzZSBhcmUgXCJmaW5nZXJpbmdzXCIsIG5vdCBcInZvaWNpbmdzXCIsIGJlY2F1c2UgdGhleSBhbHNvIGluY2x1ZGUgYmFycmUgaW5mb3JtYXRpb24uXG5jbGFzcyBGaW5nZXJpbmdcbiAgY29uc3RydWN0b3I6ICh7QHBvc2l0aW9ucywgQGNob3JkLCBAYmFycmVzLCBAaW5zdHJ1bWVudH0pIC0+XG4gICAgQHBvc2l0aW9ucy5zb3J0IChhLCBiKSAtPiBhLnN0cmluZyAtIGIuc3RyaW5nXG4gICAgQHByb3BlcnRpZXMgPSB7fVxuXG4gIEBjYWNoZWRfZ2V0dGVyICdmcmV0c3RyaW5nJywgLT5cbiAgICBmcmV0QXJyYXkgPSAoLTEgZm9yIHMgaW4gQGluc3RydW1lbnQuc3RyaW5nTnVtYmVycylcbiAgICBmcmV0QXJyYXlbc3RyaW5nXSA9IGZyZXQgZm9yIHtzdHJpbmcsIGZyZXR9IGluIEBwb3NpdGlvbnNcbiAgICAoKGlmIHggPj0gMCB0aGVuIHggZWxzZSAneCcpIGZvciB4IGluIGZyZXRBcnJheSkuam9pbignJylcblxuICBAY2FjaGVkX2dldHRlciAnY2hvcmROYW1lJywgLT5cbiAgICBuYW1lID0gQGNob3JkLm5hbWVcbiAgICBuYW1lICs9IFwiIC8gI3tnZXRQaXRjaENsYXNzTmFtZShAaW5zdHJ1bWVudC5waXRjaEF0KEBwb3NpdGlvbnNbMF0pKX1cIiBpZiBAaW52ZXJzaW9uID4gMFxuICAgIHJldHVybiBuYW1lXG5cbiAgIyBAY2FjaGVkX2dldHRlciAncGl0Y2hlcycsIC0+XG4gICMgICAoQGluc3RydW1lbnQucGl0Y2hBdChwb3NpdGlvbnMpIGZvciBwb3NpdGlvbnMgaW4gQHBvc2l0aW9ucylcblxuICAjIEBjYWNoZWRfZ2V0dGVyICdpbnRlcnZhbHMnLCAtPlxuICAjICAgXy51bmlxKGludGVydmFsQ2xhc3NEaWZmZXJlbmNlKEBjaG9yZC5yb290UGl0Y2gsIHBpdGNoQ2xhc3MpIGZvciBwaXRjaENsYXNzIGluIEAucGl0Y2hlcylcblxuICBAY2FjaGVkX2dldHRlciAnaW52ZXJzaW9uJywgLT5cbiAgICBAY2hvcmQucGl0Y2hDbGFzc2VzLmluZGV4T2YgaW50ZXJ2YWxDbGFzc0RpZmZlcmVuY2UoQGNob3JkLnJvb3RQaXRjaCwgQGluc3RydW1lbnQucGl0Y2hBdChAcG9zaXRpb25zWzBdKSlcblxuICBAY2FjaGVkX2dldHRlciAnaW52ZXJzaW9uTGV0dGVyJywgLT5cbiAgICByZXR1cm4gdW5sZXNzIEBpbnZlcnNpb24gPiAwXG4gICAgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUoOTYgKyBAaW52ZXJzaW9uKVxuXG5cbiNcbiMgQmFycmVzXG4jXG5cbnBvd2Vyc2V0ID0gKGFycmF5KSAtPlxuICByZXR1cm4gW1tdXSB1bmxlc3MgYXJyYXkubGVuZ3RoXG4gIFt4LCB4cy4uLl0gPSBhcnJheVxuICB0YWlsID0gcG93ZXJzZXQoeHMpXG4gIHJldHVybiB0YWlsLmNvbmNhdChbeF0uY29uY2F0KHlzKSBmb3IgeXMgaW4gdGFpbClcblxuIyBSZXR1cm5zIGFuIGFycmF5IG9mIHN0cmluZ3MgaW5kZXhlZCBieSBmcmV0IG51bWJlci4gRWFjaCBzdHJpbmdcbiMgaGFzIGEgY2hhcmFjdGVyIGF0IGVhY2ggc3RyaW5nIHBvc2l0aW9uOlxuIyAnPScgPSBmcmV0dGVkIGF0IHRoaXMgZnJldFxuIyAnPicgPSBmcmV0dGVkIGF0IGEgaGlnaGVyIGZyZXRcbiMgJzwnID0gZnJldHRlZCBhdCBhIGxvd2VyIGZyZXQsIG9yIG9wZW5cbiMgJ3gnID0gbXV0ZWRcbmNvbXB1dGVCYXJyZUNhbmRpZGF0ZVN0cmluZ3MgPSAoaW5zdHJ1bWVudCwgZnJldEFycmF5KSAtPlxuICBjb2RlU3RyaW5ncyA9IFtdXG4gIGZvciByZWZlcmVuY2VGcmV0IGluIGZyZXRBcnJheVxuICAgIGNvbnRpbnVlIHVubGVzcyB0eXBlb2YocmVmZXJlbmNlRnJldCkgPT0gJ251bWJlcidcbiAgICBjb2RlU3RyaW5nc1tyZWZlcmVuY2VGcmV0XSBvcj0gKGZvciBmcmV0IGluIGZyZXRBcnJheVxuICAgICAgaWYgZnJldCA8IHJlZmVyZW5jZUZyZXRcbiAgICAgICAgJzwnXG4gICAgICBlbHNlIGlmIGZyZXQgPiByZWZlcmVuY2VGcmV0XG4gICAgICAgICc+J1xuICAgICAgZWxzZSBpZiBmcmV0ID09IHJlZmVyZW5jZUZyZXRcbiAgICAgICAgJz0nXG4gICAgICBlbHNlXG4gICAgICAgICd4Jykuam9pbignJylcbiAgcmV0dXJuIGNvZGVTdHJpbmdzXG5cbmZpbmRCYXJyZXMgPSAoaW5zdHJ1bWVudCwgZnJldEFycmF5KSAtPlxuICBiYXJyZXMgPSBbXVxuICBmb3IgY29kZVN0cmluZywgZnJldCBpbiBjb21wdXRlQmFycmVDYW5kaWRhdGVTdHJpbmdzKGluc3RydW1lbnQsIGZyZXRBcnJheSlcbiAgICBjb250aW51ZSBpZiBmcmV0ID09IDBcbiAgICBjb250aW51ZSB1bmxlc3MgY29kZVN0cmluZ1xuICAgIG1hdGNoID0gY29kZVN0cmluZy5tYXRjaCgvKD1bPj1dKykvKVxuICAgIGNvbnRpbnVlIHVubGVzcyBtYXRjaFxuICAgIHJ1biA9IG1hdGNoWzFdXG4gICAgY29udGludWUgdW5sZXNzIHJ1bi5tYXRjaCgvXFw9L2cpLmxlbmd0aCA+IDFcbiAgICBiYXJyZXMucHVzaFxuICAgICAgZnJldDogZnJldFxuICAgICAgZmlyc3RTdHJpbmc6IG1hdGNoLmluZGV4XG4gICAgICBzdHJpbmdDb3VudDogcnVuLmxlbmd0aFxuICAgICAgZmluZ2VyUmVwbGFjZW1lbnRDb3VudDogcnVuLm1hdGNoKC9cXD0vZykubGVuZ3RoXG4gIHJldHVybiBiYXJyZXNcblxuY29sbGVjdEJhcnJlU2V0cyA9IChpbnN0cnVtZW50LCBmcmV0QXJyYXkpIC0+XG4gIGJhcnJlcyA9IGZpbmRCYXJyZXMoaW5zdHJ1bWVudCwgZnJldEFycmF5KVxuICByZXR1cm4gcG93ZXJzZXQoYmFycmVzKVxuXG5cbiNcbiMgRmluZ2VyaW5nc1xuI1xuXG5maW5nZXJQb3NpdGlvbnNPbkNob3JkID0gKGNob3JkLCBpbnN0cnVtZW50KSAtPlxuICB7cm9vdFBpdGNoLCBwaXRjaENsYXNzZXN9ID0gY2hvcmRcbiAgcG9zaXRpb25zID0gW11cbiAgaW5zdHJ1bWVudC5lYWNoRmluZ2VyUG9zaXRpb24gKHBvcykgLT5cbiAgICBpbnRlcnZhbENsYXNzID0gaW50ZXJ2YWxDbGFzc0RpZmZlcmVuY2Ugcm9vdFBpdGNoLCBpbnN0cnVtZW50LnBpdGNoQXQocG9zKVxuICAgIGRlZ3JlZUluZGV4ID0gcGl0Y2hDbGFzc2VzLmluZGV4T2YgaW50ZXJ2YWxDbGFzc1xuICAgIHBvc2l0aW9ucy5wdXNoIHBvcyBpZiBkZWdyZWVJbmRleCA+PSAwXG4gIHBvc2l0aW9uc1xuXG4jIFRPRE8gYWRkIG9wdGlvbnMgZm9yIHN0cnVtbWluZyB2cy4gZmluZ2Vyc3R5bGU7IG11dGluZzsgc3RyZXRjaFxuY2hvcmRGaW5nZXJpbmdzID0gKGNob3JkLCBpbnN0cnVtZW50LCBvcHRpb25zPXt9KSAtPlxuICBvcHRpb25zID0gXy5leHRlbmQge2ZpbHRlcjogdHJ1ZSwgYWxsUG9zaXRpb25zOiBmYWxzZX0sIG9wdGlvbnNcbiAgd2FybiA9IGZhbHNlXG4gIHRocm93IG5ldyBFcnJvciBcIk5vIHJvb3QgZm9yICN7dXRpbC5pbnNwZWN0IGNob3JkfVwiIHVubGVzcyBjaG9yZC5yb290UGl0Y2g/XG5cblxuICAjXG4gICMgR2VuZXJhdGVcbiAgI1xuXG4gIGZyZXRzUGVyU3RyaW5nID0gIC0+XG4gICAgcG9zaXRpb25zID0gZmluZ2VyUG9zaXRpb25zT25DaG9yZChjaG9yZCwgaW5zdHJ1bWVudClcbiAgICBwb3NpdGlvbnMgPSAocG9zIGZvciBwb3MgaW4gcG9zaXRpb25zIHdoZW4gcG9zLmZyZXQgPD0gNCkgdW5sZXNzIG9wdGlvbnMuYWxsUG9zaXRpb25zXG4gICAgc3RyaW5ncyA9IChbbnVsbF0gZm9yIHMgaW4gWzAuLi5pbnN0cnVtZW50LnN0cmluZ0NvdW50XSlcbiAgICBzdHJpbmdzW3N0cmluZ10ucHVzaCBmcmV0IGZvciB7c3RyaW5nLCBmcmV0fSBpbiBwb3NpdGlvbnNcbiAgICBzdHJpbmdzXG5cbiAgY29sbGVjdEZpbmdlcmluZ1Bvc2l0aW9ucyA9IChmcmV0Q2FuZGlkYXRlc1BlclN0cmluZykgLT5cbiAgICBzdHJpbmdDb3VudCA9IGZyZXRDYW5kaWRhdGVzUGVyU3RyaW5nLmxlbmd0aFxuICAgIHBvc2l0aW9uU2V0ID0gW11cbiAgICBmcmV0QXJyYXkgPSBbXVxuICAgIGZpbGwgPSAocykgLT5cbiAgICAgIGlmIHMgPT0gc3RyaW5nQ291bnRcbiAgICAgICAgcG9zaXRpb25TZXQucHVzaCBmcmV0QXJyYXkuc2xpY2UoKVxuICAgICAgZWxzZVxuICAgICAgICBmb3IgZnJldCBpbiBmcmV0Q2FuZGlkYXRlc1BlclN0cmluZ1tzXVxuICAgICAgICAgIGZyZXRBcnJheVtzXSA9IGZyZXRcbiAgICAgICAgICBmaWxsIHMgKyAxXG4gICAgZmlsbCAwXG4gICAgcmV0dXJuIHBvc2l0aW9uU2V0XG5cbiAgY29udGFpbnNBbGxDaG9yZFBpdGNoZXMgPSAoZnJldEFycmF5KSAtPlxuICAgIHBpdGNoZXMgPSBbXVxuICAgIGZvciBmcmV0LCBzdHJpbmcgaW4gZnJldEFycmF5XG4gICAgICBjb250aW51ZSB1bmxlc3MgdHlwZW9mKGZyZXQpIGlzICdudW1iZXInXG4gICAgICBwaXRjaENsYXNzID0gKGluc3RydW1lbnQucGl0Y2hBdCB7ZnJldCwgc3RyaW5nfSkgJSAxMlxuICAgICAgcGl0Y2hlcy5wdXNoIHBpdGNoQ2xhc3MgdW5sZXNzIHBpdGNoZXMuaW5kZXhPZihwaXRjaENsYXNzKSA+PSAwXG4gICAgcmV0dXJuIHBpdGNoZXMubGVuZ3RoID09IGNob3JkLnBpdGNoQ2xhc3Nlcy5sZW5ndGhcblxuICBtYXhpbXVtRnJldERpc3RhbmNlID0gKGZyZXRBcnJheSkgLT5cbiAgICBmcmV0cyA9IChmcmV0IGZvciBmcmV0IGluIGZyZXRBcnJheSB3aGVuIHR5cGVvZihmcmV0KSBpcyAnbnVtYmVyJylcbiAgICAjIGZyZXRBcnJheSA9IChmcmV0IGZvciBmcmV0IGluIGZyZXRBcnJheSB3aGVuIGZyZXQgPiAwKVxuICAgIHJldHVybiBNYXRoLm1heChmcmV0cy4uLikgLSBNYXRoLm1pbihmcmV0cy4uLikgPD0gM1xuXG4gIGdlbmVyYXRlRmluZ2VyaW5ncyA9IC0+XG4gICAgZmluZ2VyaW5ncyA9IFtdXG4gICAgZnJldEFycmF5cyA9IGNvbGxlY3RGaW5nZXJpbmdQb3NpdGlvbnMoZnJldHNQZXJTdHJpbmcoKSlcbiAgICBmcmV0QXJyYXlzID0gZnJldEFycmF5cy5maWx0ZXIoY29udGFpbnNBbGxDaG9yZFBpdGNoZXMpXG4gICAgZnJldEFycmF5cyA9IGZyZXRBcnJheXMuZmlsdGVyKG1heGltdW1GcmV0RGlzdGFuY2UpXG4gICAgZm9yIGZyZXRBcnJheSBpbiBmcmV0QXJyYXlzXG4gICAgICBwb3NpdGlvbnMgPSAoe2ZyZXQsIHN0cmluZ30gZm9yIGZyZXQsIHN0cmluZyBpbiBmcmV0QXJyYXkgd2hlbiB0eXBlb2YoZnJldCkgaXMgJ251bWJlcicpXG4gICAgICBmb3IgcG9zIGluIHBvc2l0aW9uc1xuICAgICAgICBwb3MuaW50ZXJ2YWxDbGFzcyA9IGludGVydmFsQ2xhc3NEaWZmZXJlbmNlIGNob3JkLnJvb3RQaXRjaCwgaW5zdHJ1bWVudC5waXRjaEF0KHBvcylcbiAgICAgICAgcG9zLmRlZ3JlZUluZGV4ID0gY2hvcmQucGl0Y2hDbGFzc2VzLmluZGV4T2YgcG9zLmludGVydmFsQ2xhc3NcbiAgICAgIHNldHMgPSBbW11dXG4gICAgICBzZXRzID0gY29sbGVjdEJhcnJlU2V0cyhpbnN0cnVtZW50LCBmcmV0QXJyYXkpIGlmIHBvc2l0aW9ucy5sZW5ndGggPiA0XG4gICAgICBmb3IgYmFycmVzIGluIHNldHNcbiAgICAgICAgZmluZ2VyaW5ncy5wdXNoIG5ldyBGaW5nZXJpbmcge3Bvc2l0aW9ucywgY2hvcmQsIGJhcnJlcywgaW5zdHJ1bWVudH1cbiAgICBmaW5nZXJpbmdzXG5cbiAgY2hvcmROb3RlQ291bnQgPSBjaG9yZC5waXRjaENsYXNzZXMubGVuZ3RoXG5cblxuICAjXG4gICMgRmlsdGVyc1xuICAjXG5cbiAgY291bnREaXN0aW5jdE5vdGVzID0gKGZpbmdlcmluZykgLT5cbiAgICAjIF8uY2hhaW4oZmluZ2VyaW5nLnBvc2l0aW9ucykucGx1Y2soJ2ludGVydmFsQ2xhc3MnKS51bmlxKCkudmFsdWUoKS5sZW5ndGhcbiAgICBwaXRjaGVzID0gW11cbiAgICBmb3Ige2ludGVydmFsQ2xhc3N9IGluIGZpbmdlcmluZy5wb3NpdGlvbnNcbiAgICAgIHBpdGNoZXMucHVzaCBpbnRlcnZhbENsYXNzIHVubGVzcyBpbnRlcnZhbENsYXNzIGluIHBpdGNoZXNcbiAgICByZXR1cm4gcGl0Y2hlcy5sZW5ndGhcblxuICBoYXNBbGxOb3RlcyA9IChmaW5nZXJpbmcpIC0+XG4gICAgcmV0dXJuIGNvdW50RGlzdGluY3ROb3RlcyhmaW5nZXJpbmcpID09IGNob3JkTm90ZUNvdW50XG5cbiAgbXV0ZWRNZWRpYWxTdHJpbmdzID0gKGZpbmdlcmluZykgLT5cbiAgICByZXR1cm4gZmluZ2VyaW5nLmZyZXRzdHJpbmcubWF0Y2goL1xcZHgrXFxkLylcblxuICBtdXRlZFRyZWJsZVN0cmluZ3MgPSAoZmluZ2VyaW5nKSAtPlxuICAgIHJldHVybiBmaW5nZXJpbmcuZnJldHN0cmluZy5tYXRjaCgveCQvKVxuXG4gIGdldEZpbmdlckNvdW50ID0gKGZpbmdlcmluZykgLT5cbiAgICBuID0gKHBvcyBmb3IgcG9zIGluIGZpbmdlcmluZy5wb3NpdGlvbnMgd2hlbiBwb3MuZnJldCA+IDApLmxlbmd0aFxuICAgIG4gLT0gYmFycmUuZmluZ2VyUmVwbGFjZW1lbnRDb3VudCAtIDEgZm9yIGJhcnJlIGluIGZpbmdlcmluZy5iYXJyZXNcbiAgICBuXG5cbiAgZm91ckZpbmdlcnNPckZld2VyID0gKGZpbmdlcmluZykgLT5cbiAgICByZXR1cm4gZ2V0RmluZ2VyQ291bnQoZmluZ2VyaW5nKSA8PSA0XG5cblxuICAjIENvbnN0cnVjdCB0aGUgZmlsdGVyIHNldFxuXG4gIGZpbHRlcnMgPSBbXVxuICAjIGZpbHRlcnMucHVzaCBuYW1lOiAnaGFzIGFsbCBjaG9yZCBub3RlcycsIHNlbGVjdDogaGFzQWxsTm90ZXNcblxuICBpZiBvcHRpb25zLmZpbHRlclxuICAgIGZpbHRlcnMucHVzaCBuYW1lOiAnZm91ciBmaW5nZXJzIG9yIGZld2VyJywgc2VsZWN0OiBmb3VyRmluZ2Vyc09yRmV3ZXJcblxuICB1bmxlc3Mgb3B0aW9ucy5maW5nZXJwaWNraW5nXG4gICAgZmlsdGVycy5wdXNoIG5hbWU6ICdubyBtdXRlZCBtZWRpYWwgc3RyaW5ncycsIHJlamVjdDogbXV0ZWRNZWRpYWxTdHJpbmdzXG4gICAgZmlsdGVycy5wdXNoIG5hbWU6ICdubyBtdXRlZCB0cmVibGUgc3RyaW5ncycsIHJlamVjdDogbXV0ZWRUcmVibGVTdHJpbmdzXG5cbiAgIyBmaWx0ZXIgYnkgYWxsIHRoZSBmaWx0ZXJzIGluIHRoZSBsaXN0LCBleGNlcHQgaWdub3JlIHRob3NlIHRoYXQgd291bGRuJ3QgcGFzcyBhbnl0aGluZ1xuICBmaWx0ZXJGaW5nZXJpbmdzID0gKGZpbmdlcmluZ3MpIC0+XG4gICAgZm9yIHtuYW1lLCBzZWxlY3QsIHJlamVjdH0gaW4gZmlsdGVyc1xuICAgICAgZmlsdGVyZWQgPSBmaW5nZXJpbmdzXG4gICAgICBzZWxlY3QgPSAoKHgpIC0+IG5vdCByZWplY3QoeCkpIGlmIHJlamVjdFxuICAgICAgZmlsdGVyZWQgPSBmaWx0ZXJlZC5maWx0ZXIoc2VsZWN0KSBpZiBzZWxlY3RcbiAgICAgIHVubGVzcyBmaWx0ZXJlZC5sZW5ndGhcbiAgICAgICAgY29uc29sZS53YXJuIFwiI3tjaG9yZF9uYW1lfTogbm8gZmluZ2VyaW5ncyBwYXNzIGZpbHRlciBcXFwiI3tuYW1lfVxcXCJcIiBpZiB3YXJuXG4gICAgICAgIGZpbHRlcmVkID0gZmluZ2VyaW5nc1xuICAgICAgZmluZ2VyaW5ncyA9IGZpbHRlcmVkXG4gICAgcmV0dXJuIGZpbmdlcmluZ3NcblxuXG4gICNcbiAgIyBTb3J0XG4gICNcblxuICAjIEZJWE1FIGNvdW50IHBpdGNoIGNsYXNzZXMsIG5vdCBzb3VuZGVkIHN0cmluZ3NcbiAgaGlnaE5vdGVDb3VudCA9IChmaW5nZXJpbmcpIC0+XG4gICAgZmluZ2VyaW5nLnBvc2l0aW9ucy5sZW5ndGhcblxuICBpc1Jvb3RQb3NpdGlvbiA9IChmaW5nZXJpbmcpIC0+XG4gICAgXyhmaW5nZXJpbmcucG9zaXRpb25zKS5zb3J0QnkoKHBvcykgLT4gcG9zLnN0cmluZylbMF0uZGVncmVlSW5kZXggPT0gMFxuXG4gIHJldmVyc2VTb3J0S2V5ID0gKGZuKSAtPiAoYSkgLT4gLWZuKGEpXG5cbiAgIyBvcmRlcmVkIGxpc3Qgb2YgcHJlZmVyZW5jZXMsIGZyb20gbW9zdCB0byBsZWFzdCBpbXBvcnRhbnRcbiAgcHJlZmVyZW5jZXMgPSBbXG4gICAge25hbWU6ICdyb290IHBvc2l0aW9uJywga2V5OiBpc1Jvb3RQb3NpdGlvbn1cbiAgICB7bmFtZTogJ2hpZ2ggbm90ZSBjb3VudCcsIGtleTogaGlnaE5vdGVDb3VudH1cbiAgICB7bmFtZTogJ2F2b2lkIGJhcnJlcycsIGtleTogcmV2ZXJzZVNvcnRLZXkoKGZpbmdlcmluZykgLT4gZmluZ2VyaW5nLmJhcnJlcy5sZW5ndGgpfVxuICAgIHtuYW1lOiAnbG93IGZpbmdlciBjb3VudCcsIGtleTogcmV2ZXJzZVNvcnRLZXkoZ2V0RmluZ2VyQ291bnQpfVxuICBdXG5cbiAgc29ydEZpbmdlcmluZ3MgPSAoZmluZ2VyaW5ncykgLT5cbiAgICBmaW5nZXJpbmdzID0gXyhmaW5nZXJpbmdzKS5zb3J0Qnkoa2V5KSBmb3Ige2tleX0gaW4gcHJlZmVyZW5jZXMuc2xpY2UoMCkucmV2ZXJzZSgpXG4gICAgZmluZ2VyaW5ncy5yZXZlcnNlKClcbiAgICByZXR1cm4gZmluZ2VyaW5nc1xuXG5cbiAgI1xuICAjIEdlbmVyYXRlLCBmaWx0ZXIsIGFuZCBzb3J0XG4gICNcblxuICBmaW5nZXJpbmdzID0gZ2VuZXJhdGVGaW5nZXJpbmdzKClcbiAgZmluZ2VyaW5ncyA9IGZpbHRlckZpbmdlcmluZ3MoZmluZ2VyaW5ncylcbiAgZmluZ2VyaW5ncyA9IHNvcnRGaW5nZXJpbmdzKGZpbmdlcmluZ3MpXG5cbiAgcHJvcGVydGllcyA9IHtcbiAgICByb290OiBpc1Jvb3RQb3NpdGlvblxuICAgIGJhcnJlczogKGYpIC0+IGYuYmFycmVzLmxlbmd0aFxuICAgIGZpbmdlcnM6IGdldEZpbmdlckNvdW50XG4gICAgaW52ZXJzaW9uOiAoZikgLT4gZi5pbnZlcnNpb25MZXR0ZXJcbiAgICAjIGJhc3M6IC9eXFxkezN9eCokL1xuICAgICMgdHJlYmxlOiAvXngqXFxkezN9JC9cbiAgICBza2lwcGluZzogL1xcZHgrXFxkL1xuICAgIG11dGluZzogL1xcZHgvXG4gICAgb3BlbjogLzAvXG4gICAgdHJpYWQ6ICh7cG9zaXRpb25zfSkgLT4gcG9zaXRpb25zLmxlbmd0aCA9PSAzXG4gICAgcG9zaXRpb246ICh7cG9zaXRpb25zfSkgLT4gTWF0aC5tYXgoXy5taW4oXy5wbHVjayhwb3NpdGlvbnMsICdmcmV0JykpIC0gMSwgMClcbiAgICBzdHJpbmdzOiAoe3Bvc2l0aW9uc30pIC0+IHBvc2l0aW9ucy5sZW5ndGhcbiAgfVxuICBmb3IgbmFtZSwgZm4gb2YgcHJvcGVydGllc1xuICAgIGZvciBmaW5nZXJpbmcgaW4gZmluZ2VyaW5nc1xuICAgICAgdmFsdWUgPSBpZiBmbiBpbnN0YW5jZW9mIFJlZ0V4cCB0aGVuIGZuLnRlc3QoZmluZ2VyaW5nLmZyZXRzdHJpbmcpIGVsc2UgZm4oZmluZ2VyaW5nKVxuICAgICAgZmluZ2VyaW5nLnByb3BlcnRpZXNbbmFtZV0gPSB2YWx1ZSBpZiB2YWx1ZVxuXG5cbiAgcmV0dXJuIGZpbmdlcmluZ3NcblxuYmVzdEZpbmdlcmluZ0ZvciA9IChjaG9yZCwgaW5zdHJ1bWVudCkgLT5cbiAgcmV0dXJuIGNob3JkRmluZ2VyaW5ncyhjaG9yZCwgaW5zdHJ1bWVudClbMF1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGJlc3RGaW5nZXJpbmdGb3JcbiAgY2hvcmRGaW5nZXJpbmdzXG59XG4iLCJ7XG4gIEZyZXRDb3VudFxuICBGcmV0TnVtYmVyc1xufSA9IHJlcXVpcmUgJy4vaW5zdHJ1bWVudHMnXG5cblxuI1xuIyBTdHlsZVxuI1xuXG5EZWZhdWx0U3R5bGUgPVxuICBoX2d1dHRlcjogMTBcbiAgdl9ndXR0ZXI6IDEwXG4gIHN0cmluZ19zcGFjaW5nOiAyMFxuICBmcmV0X3dpZHRoOiA0NVxuICBmcmV0X292ZXJoYW5nOiAuMyAqIDQ1XG5cbnBhZGRlZEZyZXRib2FyZFdpZHRoID0gKGluc3RydW1lbnQsIHN0eWxlPURlZmF1bHRTdHlsZSkgLT5cbiAgMiAqIHN0eWxlLnZfZ3V0dGVyICsgc3R5bGUuZnJldF93aWR0aCAqIEZyZXRDb3VudCArIHN0eWxlLmZyZXRfb3ZlcmhhbmdcblxucGFkZGVkRnJldGJvYXJkSGVpZ2h0ID0gKGluc3RydW1lbnQsIHN0eWxlPURlZmF1bHRTdHlsZSkgLT5cbiAgMiAqIHN0eWxlLmhfZ3V0dGVyICsgKGluc3RydW1lbnQuc3RyaW5ncyAtIDEpICogc3R5bGUuc3RyaW5nX3NwYWNpbmdcblxuXG4jXG4jIERyYXdpbmcgTWV0aG9kc1xuI1xuXG5kcmF3RnJldGJvYXJkU3RyaW5ncyA9IChpbnN0cnVtZW50LCBjdHgpIC0+XG4gIHN0eWxlID0gRGVmYXVsdFN0eWxlXG4gIGZvciBzdHJpbmcgaW4gaW5zdHJ1bWVudC5zdHJpbmdOdW1iZXJzXG4gICAgeSA9IHN0cmluZyAqIHN0eWxlLnN0cmluZ19zcGFjaW5nICsgc3R5bGUuaF9ndXR0ZXJcbiAgICBjdHguYmVnaW5QYXRoKClcbiAgICBjdHgubW92ZVRvIHN0eWxlLmhfZ3V0dGVyLCB5XG4gICAgY3R4LmxpbmVUbyBzdHlsZS5oX2d1dHRlciArIEZyZXRDb3VudCAqIHN0eWxlLmZyZXRfd2lkdGggKyBzdHlsZS5mcmV0X292ZXJoYW5nLCB5XG4gICAgY3R4LmxpbmVXaWR0aCA9IDFcbiAgICBjdHguc3Ryb2tlKClcblxuZHJhd0ZyZXRib2FyZEZyZXRzID0gKGN0eCwgaW5zdHJ1bWVudCkgLT5cbiAgc3R5bGUgPSBEZWZhdWx0U3R5bGVcbiAgZm9yIGZyZXQgaW4gRnJldE51bWJlcnNcbiAgICB4ID0gc3R5bGUuaF9ndXR0ZXIgKyBmcmV0ICogc3R5bGUuZnJldF93aWR0aFxuICAgIGN0eC5iZWdpblBhdGgoKVxuICAgIGN0eC5tb3ZlVG8geCwgc3R5bGUuaF9ndXR0ZXJcbiAgICBjdHgubGluZVRvIHgsIHN0eWxlLmhfZ3V0dGVyICsgKGluc3RydW1lbnQuc3RyaW5ncyAtIDEpICogc3R5bGUuc3RyaW5nX3NwYWNpbmdcbiAgICBjdHgubGluZVdpZHRoID0gMyBpZiBmcmV0ID09IDBcbiAgICBjdHguc3Ryb2tlKClcbiAgICBjdHgubGluZVdpZHRoID0gMVxuXG5kcmF3RnJldGJvYXJkRmluZ2VyUG9zaXRpb24gPSAoY3R4LCBpbnN0cnVtZW50LCBwb3NpdGlvbiwgb3B0aW9ucz17fSkgLT5cbiAge3N0cmluZywgZnJldH0gPSBwb3NpdGlvblxuICB7aXNSb290LCBjb2xvcn0gPSBvcHRpb25zXG4gIHN0eWxlID0gRGVmYXVsdFN0eWxlXG4gIGNvbG9yIHx8PSBpZiBpc1Jvb3QgdGhlbiAncmVkJyBlbHNlICd3aGl0ZSdcbiAgeCA9IHN0eWxlLmhfZ3V0dGVyICsgKGZyZXQgLSAwLjUpICogc3R5bGUuZnJldF93aWR0aFxuICB4ID0gc3R5bGUuaF9ndXR0ZXIgaWYgZnJldCA9PSAwXG4gIHkgPSBzdHlsZS52X2d1dHRlciArICg1IC0gc3RyaW5nKSAqIHN0eWxlLnN0cmluZ19zcGFjaW5nXG4gIGN0eC5iZWdpblBhdGgoKVxuICBjdHguYXJjIHgsIHksIDcsIDAsIDIgKiBNYXRoLlBJLCBmYWxzZVxuICBjdHguZmlsbFN0eWxlID0gY29sb3JcbiAgY3R4LmxpbmVXaWR0aCA9IDIgdW5sZXNzIGlzUm9vdFxuICBjdHguZmlsbCgpXG4gIGN0eC5zdHJva2UoKVxuICBjdHguc3Ryb2tlU3R5bGUgPSAnYmxhY2snXG4gIGN0eC5saW5lV2lkdGggPSAxXG5cbmRyYXdGcmV0Ym9hcmQgPSAoY3R4LCBpbnN0cnVtZW50LCBwb3NpdGlvbnMpIC0+XG4gIGRyYXdGcmV0Ym9hcmRTdHJpbmdzIGN0eCwgaW5zdHJ1bWVudFxuICBkcmF3RnJldGJvYXJkRnJldHMgY3R4LCBpbnN0cnVtZW50XG4gIGRyYXdGcmV0Ym9hcmRGaW5nZXJQb3NpdGlvbiBjdHgsIGluc3RydW1lbnQsIHBvc2l0aW9uLCBwb3NpdGlvbiBmb3IgcG9zaXRpb24gaW4gKHBvc2l0aW9ucyBvciBbXSlcblxubW9kdWxlLmV4cG9ydHMgPVxuICBkcmF3OiBkcmF3RnJldGJvYXJkXG4gIGhlaWdodDogcGFkZGVkRnJldGJvYXJkSGVpZ2h0XG4gIHdpZHRoOiBwYWRkZWRGcmV0Ym9hcmRXaWR0aFxuIiwiXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUnXG57SW50ZXJ2YWxOYW1lc30gPSByZXF1aXJlICcuL3RoZW9yeSdcbntibG9jaywgZHJhd1RleHQsIHdpdGhHcmFwaGljc0NvbnRleHQsIHdpdGhBbGlnbm1lbnR9ID0gcmVxdWlyZSAnLi9sYXlvdXQnXG5DaG9yZERpYWdyYW0gPSByZXF1aXJlICcuL2Nob3JkX2RpYWdyYW0nXG5cbkRlZmF1bHRTdHlsZSA9XG4gIGludGVydmFsQ2xhc3NfY29sb3JzOiBDaG9yZERpYWdyYW0uZGVmYXVsdFN0eWxlLmludGVydmFsQ2xhc3NfY29sb3JzXG4gIHJhZGl1czogNTBcbiAgY2VudGVyOiB0cnVlXG4gIGZpbGxfY2VsbHM6IGZhbHNlXG4gIGxhYmVsX2NlbGxzOiBmYWxzZVxuXG4jIEVudW1lcmF0ZSB0aGVzZSBleHBsaWNpdGx5IGluc3RlYWQgb2YgY29tcHV0aW5nIHRoZW0sXG4jIHNvIHRoYXQgd2UgY2FuIGZpbmUtdHVuZSB0aGUgcG9zaXRpb24gb2YgY2VsbHMgdGhhdFxuIyBjb3VsZCBiZSBwbGFjZWQgYXQgb25lIG9mIHNldmVyYWwgZGlmZmVyZW50IGxvY2F0aW9ucy5cbkludGVydmFsVmVjdG9ycyA9XG4gIDI6IHtQNTogLTEsIG0zOiAtMX1cbiAgMzoge20zOiAxfVxuICA0OiB7TTM6IDF9XG4gIDU6IHtQNTogLTF9XG4gIDY6IHttMzogMn1cbiAgMTE6IHtQNTogMSwgTTM6IDF9XG5cbiMgUmV0dXJucyBhIHJlY29yZCB7bTMgTTMgUDV9IHRoYXQgcmVwcmVzZW50cyB0aGUgY2Fub25pY2FsIHZlY3RvciAoYWNjb3JkaW5nIHRvIGBJbnRlcnZhbFZlY3RvcnNgKVxuIyBvZiB0aGUgaW50ZXJ2YWwgY2xhc3MuXG5pbnRlcnZhbENsYXNzVmVjdG9ycyA9IChpbnRlcnZhbENsYXNzKSAtPlxuICBvcmlnaW5hbF9pbnRlcnZhbENsYXNzID0gaW50ZXJ2YWxDbGFzcyAjIGZvciBlcnJvciByZXBvcnRpbmdcbiAgYWRqdXN0bWVudHMgPSB7fVxuICBhZGp1c3QgPSAoZF9pYywgaW50ZXJ2YWxzKSAtPlxuICAgIGludGVydmFsQ2xhc3MgKz0gZF9pY1xuICAgIGFkanVzdG1lbnRzW2tdID89IDAgZm9yIGsgb2YgaW50ZXJ2YWxzXG4gICAgYWRqdXN0bWVudHNba10gKz0gdiBmb3IgaywgdiBvZiBpbnRlcnZhbHNcbiAgYWRqdXN0IC0yNCwgUDU6IDQsIE0zOiAtMSB3aGlsZSBpbnRlcnZhbENsYXNzID49IDI0XG4gIGFkanVzdCAtMTIsIE0zOiAzIHdoaWxlIGludGVydmFsQ2xhc3MgPj0gMTJcbiAgW3JlY29yZCwgc2lnbl0gPSBbSW50ZXJ2YWxWZWN0b3JzW2ludGVydmFsQ2xhc3NdLCAxXVxuICBbcmVjb3JkLCBzaWduXSA9IFtJbnRlcnZhbFZlY3RvcnNbMTIgLSBpbnRlcnZhbENsYXNzXSwgLTFdIHVubGVzcyByZWNvcmRcbiAgaW50ZXJ2YWxzID0gXy5leHRlbmQge20zOiAwLCBNMzogMCwgUDU6IDAsIHNpZ246IDF9LCByZWNvcmRcbiAgaW50ZXJ2YWxzW2tdICo9IHNpZ24gZm9yIGsgb2YgaW50ZXJ2YWxzXG4gIGludGVydmFsc1trXSArPSB2IGZvciBrLCB2IG9mIGFkanVzdG1lbnRzXG4gIGNvbXB1dGVkX3NlbWl0b25lcyA9ICgxMiArIGludGVydmFscy5QNSAqIDcgKyBpbnRlcnZhbHMuTTMgKiA0ICsgaW50ZXJ2YWxzLm0zICogMykgJSAxMlxuICB1bmxlc3MgY29tcHV0ZWRfc2VtaXRvbmVzID09IG9yaWdpbmFsX2ludGVydmFsQ2xhc3MgJSAxMlxuICAgIGNvbnNvbGUuZXJyb3IgXCJFcnJvciBjb21wdXRpbmcgZ3JpZCBwb3NpdGlvbiBmb3IgI3tvcmlnaW5hbF9pbnRlcnZhbENsYXNzfTpcXG5cIlxuICAgICAgLCBcIiAgI3tvcmlnaW5hbF9pbnRlcnZhbENsYXNzfSAtPlwiLCBpbnRlcnZhbHNcbiAgICAgICwgJy0+JywgY29tcHV0ZWRfc2VtaXRvbmVzXG4gICAgICAsICchPScsIG9yaWdpbmFsX2ludGVydmFsQ2xhc3MgJSAxMlxuICBpbnRlcnZhbHNcblxuZHJhd0hhcm1vbmljVGFibGUgPSAoaW50ZXJ2YWxDbGFzc2VzLCBvcHRpb25zPXt9KSAtPlxuICBvcHRpb25zID0gXy5leHRlbmQge2RyYXc6IHRydWV9LCBEZWZhdWx0U3R5bGUsIG9wdGlvbnNcbiAgY29sb3JzID0gb3B0aW9ucy5pbnRlcnZhbENsYXNzX2NvbG9yc1xuICBpbnRlcnZhbENsYXNzZXMgPSBbMF0uY29uY2F0IGludGVydmFsQ2xhc3NlcyB1bmxlc3MgMCBpbiBpbnRlcnZhbENsYXNzZXNcbiAgY2VsbF9yYWRpdXMgPSBvcHRpb25zLnJhZGl1c1xuICBoZXhfcmFkaXVzID0gY2VsbF9yYWRpdXMgLyAyXG5cbiAgY2VsbF9jZW50ZXIgPSAoaW50ZXJ2YWxfa2xhc3MpIC0+XG4gICAgdmVjdG9ycyA9IGludGVydmFsQ2xhc3NWZWN0b3JzIGludGVydmFsX2tsYXNzXG4gICAgZHkgPSB2ZWN0b3JzLlA1ICsgKHZlY3RvcnMuTTMgKyB2ZWN0b3JzLm0zKSAvIDJcbiAgICBkeCA9IHZlY3RvcnMuTTMgLSB2ZWN0b3JzLm0zXG4gICAgeCA9IGR4ICogY2VsbF9yYWRpdXMgKiAuOFxuICAgIHkgPSAtZHkgKiBjZWxsX3JhZGl1cyAqIC45NVxuICAgIHt4LCB5fVxuXG4gIGJvdW5kcyA9IHtsZWZ0OiBJbmZpbml0eSwgdG9wOiBJbmZpbml0eSwgcmlnaHQ6IC1JbmZpbml0eSwgYm90dG9tOiAtSW5maW5pdHl9XG4gIGZvciBpbnRlcnZhbF9rbGFzcyBpbiBpbnRlcnZhbENsYXNzZXNcbiAgICB7eCwgeX0gPSBjZWxsX2NlbnRlciBpbnRlcnZhbF9rbGFzc1xuICAgIGJvdW5kcy5sZWZ0ID0gTWF0aC5taW4gYm91bmRzLmxlZnQsIHggLSBoZXhfcmFkaXVzXG4gICAgYm91bmRzLnRvcCA9IE1hdGgubWluIGJvdW5kcy50b3AsIHkgLSBoZXhfcmFkaXVzXG4gICAgYm91bmRzLnJpZ2h0ID0gTWF0aC5tYXggYm91bmRzLnJpZ2h0LCB4ICsgaGV4X3JhZGl1c1xuICAgIGJvdW5kcy5ib3R0b20gPSBNYXRoLm1heCBib3VuZHMuYm90dG9tLCB5ICsgaGV4X3JhZGl1c1xuXG4gIHJldHVybiB7d2lkdGg6IGJvdW5kcy5yaWdodCAtIGJvdW5kcy5sZWZ0LCBoZWlnaHQ6IGJvdW5kcy5ib3R0b20gLSBib3VuZHMudG9wfSB1bmxlc3Mgb3B0aW9ucy5kcmF3XG5cbiAgd2l0aEdyYXBoaWNzQ29udGV4dCAoY3R4KSAtPlxuICAgIGN0eC50cmFuc2xhdGUgLWJvdW5kcy5sZWZ0LCAtYm91bmRzLmJvdHRvbVxuXG4gICAgZm9yIGludGVydmFsX2tsYXNzIGluIGludGVydmFsQ2xhc3Nlc1xuICAgICAgaXNSb290ID0gaW50ZXJ2YWxfa2xhc3MgPT0gMFxuICAgICAgY29sb3IgPSBjb2xvcnNbaW50ZXJ2YWxfa2xhc3MgJSAxMl1cbiAgICAgIGNvbG9yIHx8PSBjb2xvcnNbMTIgLSBpbnRlcnZhbF9rbGFzc11cbiAgICAgIGN0eC5iZWdpblBhdGgoKVxuICAgICAge3gsIHl9ID0gY2VsbF9jZW50ZXIgaW50ZXJ2YWxfa2xhc3NcblxuICAgICAgIyBmcmFtZVxuICAgICAgZm9yIGkgaW4gWzAuLjZdXG4gICAgICAgIGEgPSBpICogTWF0aC5QSSAvIDNcbiAgICAgICAgcG9zID0gW3ggKyBoZXhfcmFkaXVzICogTWF0aC5jb3MoYSksIHkgKyBoZXhfcmFkaXVzICogTWF0aC5zaW4oYSldXG4gICAgICAgIGN0eC5tb3ZlVG8gcG9zLi4uIGlmIGkgPT0gMFxuICAgICAgICBjdHgubGluZVRvIHBvcy4uLlxuICAgICAgY3R4LnN0cm9rZVN0eWxlID0gJ2dyYXknXG4gICAgICBjdHguc3Ryb2tlKClcblxuICAgICAgIyBmaWxsXG4gICAgICBpZiBpc1Jvb3Qgb3IgKG9wdGlvbnMuZmlsbF9jZWxscyBhbmQgaW50ZXJ2YWxfa2xhc3MgPCAxMilcbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9IGNvbG9yIG9yICdyZ2JhKDI1NSwwLDAsMC4xNSknXG4gICAgICAgIGN0eC5nbG9iYWxBbHBoYSA9IDAuMyB1bmxlc3MgaXNSb290XG4gICAgICAgIGN0eC5maWxsKClcbiAgICAgICAgY3R4Lmdsb2JhbEFscGhhID0gMVxuXG4gICAgICBjb250aW51ZSBpZiBpc1Jvb3Qgb3Igb3B0aW9ucy5maWxsX2NlbGxzXG5cbiAgICAgICMgZmlsbFxuICAgICAgY3R4Lmdsb2JhbEFscGhhID0gMC4zIGlmIG9wdGlvbnMubGFiZWxfY2VsbHNcbiAgICAgIGRvIC0+XG4gICAgICAgIFtkeCwgZHksIGRuXSA9IFsteSwgeCwgMiAvIE1hdGguc3FydCh4KnggKyB5KnkpXVxuICAgICAgICBkeCAqPSBkblxuICAgICAgICBkeSAqPSBkblxuICAgICAgICBjdHguYmVnaW5QYXRoKClcbiAgICAgICAgY3R4Lm1vdmVUbyAwLCAwXG4gICAgICAgIGN0eC5saW5lVG8geCArIGR4LCB5ICsgZHlcbiAgICAgICAgY3R4LmxpbmVUbyB4IC0gZHgsIHkgLSBkeVxuICAgICAgICBjdHguZmlsbFN0eWxlID0gY29sb3JcbiAgICAgICAgY3R4LmZpbGwoKVxuXG4gICAgICBjdHguYmVnaW5QYXRoKClcbiAgICAgIGN0eC5hcmMgeCwgeSwgMiwgMCwgMiAqIE1hdGguUEksIGZhbHNlXG4gICAgICBjdHguZmlsbFN0eWxlID0gY29sb3JcbiAgICAgIGN0eC5maWxsKClcbiAgICAgIGN0eC5nbG9iYWxBbHBoYSA9IDFcblxuICAgIGN0eC5iZWdpblBhdGgoKVxuICAgIGN0eC5hcmMgMCwgMCwgMi41LCAwLCAyICogTWF0aC5QSSwgZmFsc2VcbiAgICBjdHguZmlsbFN0eWxlID0gJ3JlZCdcbiAgICBjdHguZmlsbCgpXG5cbiAgICBpZiBvcHRpb25zLmxhYmVsX2NlbGxzXG4gICAgICBmb3IgaW50ZXJ2YWxfa2xhc3MgaW4gaW50ZXJ2YWxDbGFzc2VzXG4gICAgICAgIGxhYmVsID0gSW50ZXJ2YWxOYW1lc1tpbnRlcnZhbF9rbGFzc11cbiAgICAgICAgbGFiZWwgPSAnUicgaWYgaW50ZXJ2YWxfa2xhc3MgPT0gMFxuICAgICAgICB7eCwgeX0gPSBjZWxsX2NlbnRlciBpbnRlcnZhbF9rbGFzc1xuICAgICAgICBkcmF3VGV4dCBsYWJlbCwgZm9udDogJzEwcHQgVGltZXMnLCBmaWxsU3R5bGU6ICdibGFjaycsIHg6IHgsIHk6IHksIGdyYXZpdHk6ICdjZW50ZXInXG5cbmhhcm1vbmljVGFibGVCbG9jayA9ICh0b25lcywgb3B0aW9ucykgLT5cbiAgZGltZW5zaW9ucyA9IGRyYXdIYXJtb25pY1RhYmxlIHRvbmVzLCBfLmV4dGVuZCh7fSwgb3B0aW9ucywgY29tcHV0ZV9ib3VuZHM6IHRydWUsIGRyYXc6IGZhbHNlKVxuICBibG9ja1xuICAgIHdpZHRoOiBkaW1lbnNpb25zLndpZHRoXG4gICAgaGVpZ2h0OiBkaW1lbnNpb25zLmhlaWdodFxuICAgIGRyYXc6IC0+XG4gICAgICBkcmF3SGFybW9uaWNUYWJsZSB0b25lcywgb3B0aW9uc1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgZHJhdzogZHJhd0hhcm1vbmljVGFibGVcbiAgYmxvY2s6IGhhcm1vbmljVGFibGVCbG9ja1xufVxuIiwie2ludGVydmFsQ2xhc3NEaWZmZXJlbmNlLCBwaXRjaEZyb21TY2llbnRpZmljTm90YXRpb259ID0gcmVxdWlyZSgnLi90aGVvcnknKVxuXG4jXG4jIEZyZXRib2FyZFxuI1xuXG5jbGFzcyBJbnN0cnVtZW50XG4gIHN0cmluZ0NvdW50OiA2XG4gIHN0cmluZ3M6IDZcbiAgZnJldENvdW50OiAxMlxuICBzdHJpbmdOdW1iZXJzOiBbMC4uNV1cbiAgc3RyaW5nUGl0Y2hlczogJ0U0IEIzIEczIEQzIEEyIEUyJy5zcGxpdCgvXFxzLykucmV2ZXJzZSgpLm1hcCBwaXRjaEZyb21TY2llbnRpZmljTm90YXRpb25cblxuICBlYWNoRmluZ2VyUG9zaXRpb246IChmbikgLT5cbiAgICBmb3Igc3RyaW5nIGluIEBzdHJpbmdOdW1iZXJzXG4gICAgICBmb3IgZnJldCBpbiBbMC4uQGZyZXRDb3VudF1cbiAgICAgICAgZm4gc3RyaW5nOiBzdHJpbmcsIGZyZXQ6IGZyZXRcblxuICBwaXRjaEF0OiAoe3N0cmluZywgZnJldH0pIC0+XG4gICAgQHN0cmluZ1BpdGNoZXNbc3RyaW5nXSArIGZyZXRcblxuRnJldE51bWJlcnMgPSBbMC4uNF0gICMgaW5jbHVkZXMgbnV0XG5GcmV0Q291bnQgPSBGcmV0TnVtYmVycy5sZW5ndGggLSAxICAjIGRvZXNuJ3QgaW5jbHVkZSBudXRcblxuaW50ZXJ2YWxQb3NpdGlvbnNGcm9tUm9vdCA9IChpbnN0cnVtZW50LCByb290UG9zaXRpb24sIHNlbWl0b25lcykgLT5cbiAgcm9vdFBpdGNoID0gaW5zdHJ1bWVudC5waXRjaEF0KHJvb3RQb3NpdGlvbilcbiAgcG9zaXRpb25zID0gW11cbiAgZnJldGJvYXJkX3Bvc2l0aW9uc19lYWNoIChmaW5nZXJQb3NpdGlvbikgLT5cbiAgICByZXR1cm4gdW5sZXNzIGludGVydmFsQ2xhc3NEaWZmZXJlbmNlKHJvb3RQaXRjaCwgaW5zdHJ1bWVudC5waXRjaEF0KGZpbmdlclBvc2l0aW9uKSkgPT0gc2VtaXRvbmVzXG4gICAgcG9zaXRpb25zLnB1c2ggZmluZ2VyUG9zaXRpb25cbiAgcmV0dXJuIHBvc2l0aW9uc1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgRGVmYXVsdDogbmV3IEluc3RydW1lbnRcbiAgRnJldE51bWJlcnNcbiAgRnJldENvdW50XG4gIGludGVydmFsUG9zaXRpb25zRnJvbVJvb3Rcbn1cbiIsImZzID0gcmVxdWlyZSAnZnMnXG5wYXRoID0gcmVxdWlyZSAncGF0aCdcbnV0aWwgPSByZXF1aXJlICd1dGlsJ1xuXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUnXG5DYW52YXMgPSByZXF1aXJlICdjYW52YXMnXG5cblxuI1xuIyBEcmF3aW5nXG4jXG5cbkNvbnRleHQgPVxuICBjYW52YXM6IG51bGxcbiAgY3R4OiBudWxsXG5cbmVyYXNlX2JhY2tncm91bmQgPSAtPlxuICB7Y2FudmFzLCBjdHh9ID0gQ29udGV4dFxuICBjdHguZmlsbFN0eWxlID0gJ3doaXRlJ1xuICBjdHguZmlsbFJlY3QgMCwgMCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0XG5cbm1lYXN1cmVfdGV4dCA9ICh0ZXh0LCB7Zm9udH09e30pIC0+XG4gIGN0eCA9IENvbnRleHQuY3R4XG4gIGN0eC5mb250ID0gZm9udCBpZiBmb250XG4gIGN0eC5tZWFzdXJlVGV4dCB0ZXh0XG5cbmRyYXdUZXh0ID0gKHRleHQsIG9wdGlvbnM9e30pIC0+XG4gIGN0eCA9IENvbnRleHQuY3R4XG4gIG9wdGlvbnMgPSB0ZXh0IGlmIF8uaXNPYmplY3QgdGV4dFxuICB7Zm9udCwgZmlsbFN0eWxlLCB4LCB5LCBncmF2aXR5LCB3aWR0aH0gPSBvcHRpb25zXG4gIGdyYXZpdHkgfHw9ICcnXG4gIGlmIG9wdGlvbnMuY2hvaWNlc1xuICAgIGZvciBjaG9pY2UgaW4gb3B0aW9ucy5jaG9pY2VzXG4gICAgICB0ZXh0ID0gY2hvaWNlIGlmIF8uaXNTdHJpbmcgY2hvaWNlXG4gICAgICB7Zm9udH0gPSBjaG9pY2UgaWYgXy5pc09iamVjdCBjaG9pY2VcbiAgICAgIGJyZWFrIGlmIG1lYXN1cmVfdGV4dCh0ZXh0LCBmb250OiBmb250KS53aWR0aCA8PSBvcHRpb25zLndpZHRoXG4gIGN0eC5mb250ID0gZm9udCBpZiBmb250XG4gIGN0eC5maWxsU3R5bGUgPSBmaWxsU3R5bGUgaWYgZmlsbFN0eWxlXG4gIG0gPSBjdHgubWVhc3VyZVRleHQgdGV4dFxuICB4IHx8PSAwXG4gIHkgfHw9IDBcbiAgeCAtPSBtLndpZHRoIC8gMiBpZiBncmF2aXR5Lm1hdGNoKC9eKHRvcHxjZW50ZXJ8bWlkZGxlfGNlbnRlcmJvdHRvbSkkL2kpXG4gIHggLT0gbS53aWR0aCBpZiBncmF2aXR5Lm1hdGNoKC9eKHJpZ2h0fHRvcFJpZ2h0fGJvdFJpZ2h0KSQvaSlcbiAgeSAtPSBtLmVtSGVpZ2h0RGVzY2VudCBpZiBncmF2aXR5Lm1hdGNoKC9eKGJvdHRvbXxib3RMZWZ0fGJvdFJpZ2h0KSQvaSlcbiAgeSArPSBtLmVtSGVpZ2h0QXNjZW50IGlmIGdyYXZpdHkubWF0Y2goL14odG9wfHRvcExlZnR8dG9wUmlnaHQpJC9pKVxuICBjdHguZmlsbFRleHQgdGV4dCwgeCwgeVxuXG53aXRoQ2FudmFzID0gKGNhbnZhcywgY2IpIC0+XG4gIHNhdmVkQ2FudmFzID0gQ29udGV4dC5jYW52YXNcbiAgc2F2ZWRDb250ZXh0ID0gQ29udGV4dC5jb250ZXh0XG4gIHRyeVxuICAgIENvbnRleHQuY2FudmFzID0gY2FudmFzXG4gICAgQ29udGV4dC5jdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKVxuICAgIHJldHVybiBjYigpXG4gIGZpbmFsbHlcbiAgICBDb250ZXh0LmNhbnZhcyA9IHNhdmVkQ2FudmFzXG4gICAgQ29udGV4dC5jb250ZXh0ID0gc2F2ZWRDb250ZXh0XG5cbndpdGhHcmFwaGljc0NvbnRleHQgPSAoZm4pIC0+XG4gIGN0eCA9IENvbnRleHQuY3R4XG4gIGN0eC5zYXZlKClcbiAgdHJ5XG4gICAgZm4gY3R4XG4gIGZpbmFsbHlcbiAgICBjdHgucmVzdG9yZSgpXG5cblxuI1xuIyBCb3gtYmFzZWQgRGVjbGFyYXRpdmUgTGF5b3V0XG4jXG5cbmJveCA9IChwYXJhbXMpIC0+XG4gIGJveCA9IF8uZXh0ZW5kIHt3aWR0aDogMH0sIHBhcmFtc1xuICBib3guaGVpZ2h0ID89IChib3guYXNjZW50ID8gMCkgKyAoYm94LmRlc2NlbnQgPyAwKVxuICBib3guYXNjZW50ID89IGJveC5oZWlnaHQgLSAoYm94LmRlc2NlbnQgPyAwKVxuICBib3guZGVzY2VudCA/PSBib3guaGVpZ2h0IC0gYm94LmFzY2VudFxuICBib3hcblxucGFkQm94ID0gKGJveCwgb3B0aW9ucykgLT5cbiAgYm94LmhlaWdodCArPSBvcHRpb25zLmJvdHRvbSBpZiBvcHRpb25zLmJvdHRvbVxuICBib3guZGVzY2VudCA9ICgoYm94LmRlc2NlbnQgPyAwKSArIG9wdGlvbnMuYm90dG9tKSBpZiBvcHRpb25zLmJvdHRvbVxuICBib3hcblxudGV4dEJveCA9ICh0ZXh0LCBvcHRpb25zKSAtPlxuICBvcHRpb25zID0gXy5leHRlbmQge30sIG9wdGlvbnMsIGdyYXZpdHk6IGZhbHNlXG4gIG1lYXN1cmUgPSBtZWFzdXJlX3RleHQgdGV4dCwgb3B0aW9uc1xuICBib3hcbiAgICB3aWR0aDogbWVhc3VyZS53aWR0aFxuICAgIGhlaWdodDogbWVhc3VyZS5lbUhlaWdodEFzY2VudCArIG1lYXN1cmUuZW1IZWlnaHREZXNjZW50XG4gICAgZGVzY2VudDogbWVhc3VyZS5lbUhlaWdodERlc2NlbnRcbiAgICBkcmF3OiAtPiBkcmF3VGV4dCB0ZXh0LCBvcHRpb25zXG5cbnZib3ggPSAoYm94ZXMuLi4pIC0+XG4gIG9wdGlvbnMgPSB7fVxuICBvcHRpb25zID0gYm94ZXMucG9wKCkgdW5sZXNzIGJveGVzW2JveGVzLmxlbmd0aCAtIDFdLndpZHRoP1xuICBvcHRpb25zID0gXy5leHRlbmQge2FsaWduOiAnbGVmdCd9LCBvcHRpb25zXG4gIHdpZHRoID0gTWF0aC5tYXggXy5wbHVjayhib3hlcywgJ3dpZHRoJykuLi5cbiAgaGVpZ2h0ID0gXy5wbHVjayhib3hlcywgJ2hlaWdodCcpLnJlZHVjZSAoYSwgYikgLT4gYSArIGJcbiAgZGVzY2VudCA9IGJveGVzW2JveGVzLmxlbmd0aCAtIDFdLmRlc2NlbnRcbiAgaWYgb3B0aW9ucy5iYXNlbGluZVxuICAgIGJveGVzX2JlbG93ID0gYm94ZXNbYm94ZXMuaW5kZXhPZihvcHRpb25zLmJhc2VsaW5lKSsxLi4uXVxuICAgIGRlc2NlbnQgPSBvcHRpb25zLmJhc2VsaW5lLmRlc2NlbnQgKyBfLnBsdWNrKGJveGVzX2JlbG93LCAnaGVpZ2h0JykucmVkdWNlICgoYSwgYikgLT4gYSArIGIpLCAwXG4gIGJveFxuICAgIHdpZHRoOiB3aWR0aFxuICAgIGhlaWdodDogaGVpZ2h0XG4gICAgZGVzY2VudDogZGVzY2VudFxuICAgIGRyYXc6IC0+XG4gICAgICBkeSA9IC1oZWlnaHRcbiAgICAgIGJveGVzLmZvckVhY2ggKGIxKSAtPlxuICAgICAgICB3aXRoR3JhcGhpY3NDb250ZXh0IChjdHgpIC0+XG4gICAgICAgICAgZHggPSBzd2l0Y2ggb3B0aW9ucy5hbGlnblxuICAgICAgICAgICAgd2hlbiAnbGVmdCcgdGhlbiAwXG4gICAgICAgICAgICB3aGVuICdjZW50ZXInIHRoZW4gTWF0aC5tYXggMCwgKHdpZHRoIC0gYjEud2lkdGgpIC8gMlxuICAgICAgICAgIGN0eC50cmFuc2xhdGUgZHgsIGR5ICsgYjEuaGVpZ2h0IC0gYjEuZGVzY2VudFxuICAgICAgICAgIGIxLmRyYXc/KGN0eClcbiAgICAgICAgICBkeSArPSBiMS5oZWlnaHRcblxuYWJvdmUgPSB2Ym94XG5cbmhib3ggPSAoYjEsIGIyKSAtPlxuICBjb250YWluZXJfc2l6ZSA9IEN1cnJlbnRCb29rPy5wYWdlX29wdGlvbnMgb3IgQ3VycmVudFBhZ2VcbiAgYm94ZXMgPSBbYjEsIGIyXVxuICBoZWlnaHQgPSBNYXRoLm1heCBfLnBsdWNrKGJveGVzLCAnaGVpZ2h0JykuLi5cbiAgd2lkdGggPSBfLnBsdWNrKGJveGVzLCAnd2lkdGgnKS5yZWR1Y2UgKGEsIGIpIC0+IGEgKyBiXG4gIHdpZHRoID0gY29udGFpbmVyX3NpemUud2lkdGggaWYgd2lkdGggPT0gSW5maW5pdHlcbiAgc3ByaW5nX2NvdW50ID0gKGIgZm9yIGIgaW4gYm94ZXMgd2hlbiBiLndpZHRoID09IEluZmluaXR5KS5sZW5ndGhcbiAgYm94XG4gICAgd2lkdGg6IHdpZHRoXG4gICAgaGVpZ2h0OiBoZWlnaHRcbiAgICBkcmF3OiAtPlxuICAgICAgeCA9IDBcbiAgICAgIGJveGVzLmZvckVhY2ggKGIpIC0+XG4gICAgICAgIHdpdGhHcmFwaGljc0NvbnRleHQgKGN0eCkgLT5cbiAgICAgICAgICBjdHgudHJhbnNsYXRlIHgsIDBcbiAgICAgICAgICBiLmRyYXc/KGN0eClcbiAgICAgICAgaWYgYi53aWR0aCA9PSBJbmZpbml0eVxuICAgICAgICAgIHggKz0gKHdpZHRoIC0gKHdpZHRoIGZvciB7d2lkdGh9IGluIGJveGVzIHdoZW4gd2lkdGggIT0gSW5maW5pdHkpLnJlZHVjZSAoYSwgYikgLT4gYSArIGIpIC8gc3ByaW5nX2NvdW50XG4gICAgICAgIGVsc2VcbiAgICAgICAgICB4ICs9IGIud2lkdGhcblxub3ZlcmxheSA9IChib3hlcy4uLikgLT5cbiAgYm94XG4gICAgd2lkdGg6IE1hdGgubWF4IF8ucGx1Y2soYm94ZXMsICd3aWR0aCcpLi4uXG4gICAgaGVpZ2h0OiBNYXRoLm1heCBfLnBsdWNrKGJveGVzLCAnaGVpZ2h0JykuLi5cbiAgICBkcmF3OiAtPlxuICAgICAgZm9yIGIgaW4gYm94ZXNcbiAgICAgICAgd2l0aEdyYXBoaWNzQ29udGV4dCAoY3R4KSAtPlxuICAgICAgICAgIGIuZHJhdyBjdHhcblxubGFiZWxlZCA9ICh0ZXh0LCBvcHRpb25zLCBib3gpIC0+XG4gIFtvcHRpb25zLCBib3hdID0gW3t9LCBvcHRpb25zXSBpZiBhcmd1bWVudHMubGVuZ3RoID09IDJcbiAgZGVmYXVsdF9vcHRpb25zID1cbiAgICBmb250OiAnMTJweCBUaW1lcydcbiAgICBmaWxsU3R5bGU6ICdibGFjaydcbiAgb3B0aW9ucyA9IF8uZXh0ZW5kIGRlZmF1bHRfb3B0aW9ucywgb3B0aW9uc1xuICBhYm92ZSB0ZXh0Qm94KHRleHQsIG9wdGlvbnMpLCBib3gsIG9wdGlvbnNcblxud2l0aEdyaWRCb3hlcyA9IChvcHRpb25zLCBnZW5lcmF0b3IpIC0+XG4gIHttYXgsIGZsb29yfSA9IE1hdGhcblxuICBvcHRpb25zID0gXy5leHRlbmQge2hlYWRlcl9oZWlnaHQ6IDAsIGd1dHRlcl93aWR0aDogMTAsIGd1dHRlcl9oZWlnaHQ6IDEwfSwgb3B0aW9uc1xuICBjb250YWluZXJfc2l6ZSA9IEN1cnJlbnRCb29rPy5wYWdlX29wdGlvbnMgb3IgQ3VycmVudFBhZ2VcblxuICBsaW5lX2JyZWFrID0ge3dpZHRoOiAwLCBoZWlnaHQ6IDAsIGxpbmVicmVhazogdHJ1ZX1cbiAgaGVhZGVyID0gbnVsbFxuICBjZWxscyA9IFtdXG4gIGdlbmVyYXRvclxuICAgIGhlYWRlcjogKGJveCkgLT4gaGVhZGVyID0gYm94XG4gICAgc3RhcnRSb3c6ICgpIC0+IGNlbGxzLnB1c2ggbGluZV9icmVha1xuICAgIGNlbGw6IChib3gpIC0+IGNlbGxzLnB1c2ggYm94XG4gICAgY2VsbHM6IChib3hlcykgLT4gY2VsbHMucHVzaCBiIGZvciBiIGluIGJveGVzXG5cbiAgY2VsbF93aWR0aCA9IG1heCBfLnBsdWNrKGNlbGxzLCAnd2lkdGgnKS4uLlxuICBjZWxsX2hlaWdodCA9IG1heCBfLnBsdWNrKGNlbGxzLCAnaGVpZ2h0JykuLi5cbiAgIyBjZWxsLmRlc2NlbnQgPz0gMCBmb3IgY2VsbCBpbiBjZWxsc1xuXG4gIF8uZXh0ZW5kIG9wdGlvbnNcbiAgICAsIGhlYWRlcl9oZWlnaHQ6IGhlYWRlcj8uaGVpZ2h0IG9yIDBcbiAgICAsIGNlbGxfd2lkdGg6IGNlbGxfd2lkdGhcbiAgICAsIGNlbGxfaGVpZ2h0OiBjZWxsX2hlaWdodFxuICAgICwgY29sczogbWF4IDEsIGZsb29yKChjb250YWluZXJfc2l6ZS53aWR0aCArIG9wdGlvbnMuZ3V0dGVyX3dpZHRoKSAvIChjZWxsX3dpZHRoICsgb3B0aW9ucy5ndXR0ZXJfd2lkdGgpKVxuICBvcHRpb25zLnJvd3MgPSBkbyAtPlxuICAgIGNvbnRlbnRfaGVpZ2h0ID0gY29udGFpbmVyX3NpemUuaGVpZ2h0IC0gb3B0aW9ucy5oZWFkZXJfaGVpZ2h0XG4gICAgY2VsbF9oZWlnaHQgPSBjZWxsX2hlaWdodCArIG9wdGlvbnMuZ3V0dGVyX2hlaWdodFxuICAgIG1heCAxLCBmbG9vcigoY29udGVudF9oZWlnaHQgKyBvcHRpb25zLmd1dHRlcl9oZWlnaHQpIC8gY2VsbF9oZWlnaHQpXG5cbiAgY2VsbC5kZXNjZW50ID89IDAgZm9yIGNlbGwgaW4gY2VsbHNcbiAgbWF4X2Rlc2NlbnQgPSBtYXggXy5wbHVjayhjZWxscywgJ2Rlc2NlbnQnKS4uLlxuICAjIGNvbnNvbGUuaW5mbyAnZGVzY2VudCcsIG1heF9kZXNjZW50LCAnZnJvbScsIF8ucGx1Y2soY2VsbHMsICdkZXNjZW50JylcblxuICB3aXRoR3JpZCBvcHRpb25zLCAoZ3JpZCkgLT5cbiAgICBpZiBoZWFkZXJcbiAgICAgIHdpdGhHcmFwaGljc0NvbnRleHQgKGN0eCkgLT5cbiAgICAgICAgY3R4LnRyYW5zbGF0ZSAwLCBoZWFkZXIuaGVpZ2h0IC0gaGVhZGVyLmRlc2NlbnRcbiAgICAgICAgaGVhZGVyPy5kcmF3IGN0eFxuICAgIGNlbGxzLmZvckVhY2ggKGNlbGwpIC0+XG4gICAgICBncmlkLnN0YXJ0Um93KCkgaWYgY2VsbC5saW5lYnJlYWs/XG4gICAgICByZXR1cm4gaWYgY2VsbCA9PSBsaW5lX2JyZWFrXG4gICAgICBncmlkLmFkZF9jZWxsIC0+XG4gICAgICAgIHdpdGhHcmFwaGljc0NvbnRleHQgKGN0eCkgLT5cbiAgICAgICAgICBjdHgudHJhbnNsYXRlIDAsIGNlbGxfaGVpZ2h0IC0gY2VsbC5kZXNjZW50XG4gICAgICAgICAgY2VsbC5kcmF3IGN0eFxuXG5cbiNcbiMgRmlsZSBTYXZpbmdcbiNcblxuQnVpbGREaXJlY3RvcnkgPSAnLidcbkRlZmF1bHRGaWxlbmFtZSA9IG51bGxcblxuZGlyZWN0b3J5ID0gKHBhdGgpIC0+IEJ1aWxkRGlyZWN0b3J5ID0gcGF0aFxuZmlsZW5hbWUgPSAobmFtZSkgLT4gRGVmYXVsdEZpbGVuYW1lID0gbmFtZVxuXG5zYXZlX2NhbnZhc190b19wbmcgPSAoY2FudmFzLCBmbmFtZSkgLT5cbiAgb3V0ID0gZnMuY3JlYXRlV3JpdGVTdHJlYW0ocGF0aC5qb2luKEJ1aWxkRGlyZWN0b3J5LCBmbmFtZSkpXG4gIHN0cmVhbSA9IGNhbnZhcy5wbmdTdHJlYW0oKVxuICBzdHJlYW0ub24gJ2RhdGEnLCAoY2h1bmspIC0+IG91dC53cml0ZShjaHVuaylcbiAgc3RyZWFtLm9uICdlbmQnLCAoKSAtPiBjb25zb2xlLmluZm8gXCJTYXZlZCAje2ZuYW1lfVwiXG5cblxuI1xuIyBQYXBlciBTaXplc1xuI1xuXG5QYXBlclNpemVzID1cbiAgZm9saW86ICcxMmluIHggMTVpbidcbiAgcXVhcnRvOiAnOS41aW4geCAxMmluJ1xuICBvY3Rhdm86ICc2aW4geCA5aW4nXG4gIGR1b2RlY2ltbzogJzVpbiB4IDcuMzc1aW4nXG4gICMgQU5TSSBzaXplc1xuICAnQU5TSSBBJzogJzguNWluIMOXIDExaW4nXG4gICdBTlNJIEInOiAnMTFpbiB4IDE3aW4nXG4gIGxldHRlcjogJ0FOU0kgQSdcbiAgbGVkZ2VyOiAnQU5TSSBCIGxhbmRzY2FwZSdcbiAgdGFibG9pZDogJ0FOU0kgQiBwb3J0cmFpdCdcbiAgJ0FOU0kgQyc6ICcxN2luIMOXIDIyaW4nXG4gICdBTlNJIEQnOiAnMjJpbiDDlyAzNGluJ1xuICAnQU5TSSBFJzogJzM0aW4gw5cgNDRpbidcblxuZ2V0X3BhZ2Vfc2l6ZV9kaW1lbnNpb25zID0gKHNpemUsIG9yaWVudGF0aW9uPW51bGwpIC0+XG4gIHBhcnNlTWVhc3VyZSA9IChtZWFzdXJlKSAtPlxuICAgIHJldHVybiBtZWFzdXJlIGlmIHR5cGVvZiBtZWFzdXJlID09ICdudW1iZXInXG4gICAgdW5sZXNzIG1lYXN1cmUubWF0Y2ggL14oXFxkKyg/OlxcLlxcZCopPylcXHMqKC4rKSQvXG4gICAgICB0aHJvdyBuZXcgRXJyb3IgXCJVbnJlY29nbml6ZWQgbWVhc3VyZSAje3V0aWwuaW5zcGVjdCBtZWFzdXJlfSBpbiAje3V0aWwuaW5zcGVjdCBzaXplfVwiXG4gICAgW24sIHVuaXRzXSA9IFtOdW1iZXIoUmVnRXhwLiQxKSwgUmVnRXhwLiQyXVxuICAgIHN3aXRjaCB1bml0c1xuICAgICAgd2hlbiBcIlwiIHRoZW4gblxuICAgICAgd2hlbiBcImluXCIgdGhlbiBuICogNzJcbiAgICAgIGVsc2UgdGhyb3cgbmV3IEVycm9yIFwiVW5yZWNvZ25pemVkIHVuaXRzICN7dXRpbC5pbnNwZWN0IHVuaXRzfSBpbiAje3V0aWwuaW5zcGVjdCBzaXplfVwiXG5cbiAge3dpZHRoLCBoZWlnaHR9ID0gc2l6ZVxuICB3aGlsZSBfLmlzU3RyaW5nKHNpemUpXG4gICAgW3NpemUsIG9yaWVudGF0aW9uXSA9IFtSZWdFeHAuJDEsIFJlZ0V4cC5SMl0gaWYgc2l6ZS5tYXRjaCAvXiguKylcXHMrKGxhbmRzY2FwZXxwb3J0cmFpdCkkL1xuICAgIGJyZWFrIHVubGVzcyBzaXplIG9mIFBhcGVyU2l6ZXNcbiAgICBzaXplID0gUGFwZXJTaXplc1tzaXplXVxuICAgIHt3aWR0aCwgaGVpZ2h0fSA9IHNpemVcbiAgaWYgXy5pc1N0cmluZyhzaXplKVxuICAgIHRocm93IG5ldyBFcnJvciBcIlVucmVjb2duaXplZCBib29rIHNpemUgZm9ybWF0ICN7dXRpbC5pbnNwZWN0IHNpemV9XCIgdW5sZXNzIHNpemUubWF0Y2ggL14oLis/KVxccypbeMOXXVxccyooLispJC9cbiAgICBbd2lkdGgsIGhlaWdodF0gPSBbUmVnRXhwLiQxLCBSZWdFeHAuJDJdXG5cbiAgW3dpZHRoLCBoZWlnaHRdID0gW3BhcnNlTWVhc3VyZSh3aWR0aCksIHBhcnNlTWVhc3VyZShoZWlnaHQpXVxuICBzd2l0Y2ggb3JpZW50YXRpb24gb3IgJydcbiAgICB3aGVuICdsYW5kc2NhcGUnIHRoZW4gW3dpZHRoLCBoZWlnaHRdID0gW2hlaWdodCwgd2lkdGhdIHVubGVzcyB3aWR0aCA+IGhlaWdodFxuICAgIHdoZW4gJ3BvcnRyYWl0JyB0aGVuIFt3aWR0aCwgaGVpZ2h0XSA9IFtoZWlnaHQsIHdpZHRoXSBpZiB3aWR0aCA+IGhlaWdodFxuICAgIHdoZW4gJycgdGhlbiBudWxsXG4gICAgZWxzZSB0aHJvdyBuZXcgRXJyb3IgXCJVbmtub3duIG9yaWVudGF0aW9uICN7dXRpbC5pbnNwZWN0IG9yaWVudGF0aW9ufVwiXG4gIHt3aWR0aCwgaGVpZ2h0fVxuXG5kbyAtPlxuICBmb3IgbmFtZSwgdmFsdWUgb2YgUGFwZXJTaXplc1xuICAgIFBhcGVyU2l6ZXNbbmFtZV0gPSBnZXRfcGFnZV9zaXplX2RpbWVuc2lvbnMgdmFsdWVcblxuXG4jXG4jIExheW91dFxuI1xuXG5DdXJyZW50UGFnZSA9IG51bGxcbkN1cnJlbnRCb29rID0gbnVsbFxuTW9kZSA9IG51bGxcblxuXy5taXhpblxuICBzdW06XG4gICAgZG8gKHBsdXM9KGEsYikgLT4gYStiKSAtPlxuICAgICAgKHhzKSAtPiBfLnJlZHVjZSh4cywgcGx1cywgMClcblxuVERMUkxheW91dCA9IChib3hlcykgLT5cbiAgcGFnZV93aWR0aCA9IEN1cnJlbnRQYWdlLndpZHRoIC0gQ3VycmVudFBhZ2UubGVmdF9tYXJnaW4gLSBDdXJyZW50UGFnZS50b3BfbWFyZ2luXG4gIGJveGVzID0gYm94ZXNbLi5dXG4gIGIuZGVzY2VudCA/PSAwIGZvciBiIGluIGJveGVzXG4gIGR5ID0gMFxuICB3aWR0aCA9IDBcbiAgd2hpbGUgYm94ZXMubGVuZ3RoXG4gICAgY29uc29sZS5pbmZvICduZXh0JywgYm94ZXMubGVuZ3RoXG4gICAgbGluZSA9IFtdXG4gICAgd2hpbGUgYm94ZXMubGVuZ3RoXG4gICAgICBiID0gYm94ZXNbMF1cbiAgICAgIGJyZWFrIGlmIHdpZHRoICsgYi53aWR0aCA+IHBhZ2Vfd2lkdGggYW5kIGxpbmUubGVuZ3RoID4gMFxuICAgICAgbGluZS5wdXNoIGJcbiAgICAgIGJveGVzLnNoaWZ0KClcbiAgICAgIHdpZHRoICs9IGIud2lkdGhcbiAgICBhc2NlbnQgPSBfLm1heChiLmhlaWdodCAtIGIuZGVzY2VudCBmb3IgYiBpbiBsaW5lKVxuICAgIGRlc2NlbnQgPSBfLmNoYWluKGxpbmUpLnBsdWNrKCdkZXNjZW50JykubWF4KClcbiAgICBkeCA9IDBcbiAgICBjb25zb2xlLmluZm8gJ2RyYXcnLCBsaW5lLmxlbmd0aFxuICAgIGZvciBiIGluIGxpbmVcbiAgICAgIHdpdGhHcmFwaGljc0NvbnRleHQgKGN0eCkgLT5cbiAgICAgICAgY3R4LnRyYW5zbGF0ZSBkeCwgZHkgKyBhc2NlbnRcbiAgICAgICAgY29uc29sZS5pbmZvICdkcmF3JywgZHgsIGR5ICsgYXNjZW50LCBiLmRyYXdcbiAgICAgICAgYi5kcmF3IGN0eFxuICAgICAgZHggKz0gYi53aWR0aFxuICAgIGR5ICs9IGFzY2VudCArIGRlc2NlbnRcblxud2l0aFBhZ2UgPSAob3B0aW9ucywgZHJhd19wYWdlKSAtPlxuICB0aHJvdyBuZXcgRXJyb3IgXCJBbHJlYWR5IGluc2lkZSBhIHBhZ2VcIiBpZiBDdXJyZW50UGFnZVxuICBkZWZhdWx0cyA9IHt3aWR0aDogMTAwLCBoZWlnaHQ6IDEwMCwgcGFnZV9tYXJnaW46IDEwfVxuICB7d2lkdGgsIGhlaWdodCwgcGFnZV9tYXJnaW59ID0gXy5leHRlbmQgZGVmYXVsdHMsIG9wdGlvbnNcbiAge2xlZnRfbWFyZ2luLCB0b3BfbWFyZ2luLCByaWdodF9tYXJnaW4sIGJvdHRvbV9tYXJnaW59ID0gb3B0aW9uc1xuICBsZWZ0X21hcmdpbiA/PSBwYWdlX21hcmdpblxuICB0b3BfbWFyZ2luID89IHBhZ2VfbWFyZ2luXG4gIHJpZ2h0X21hcmdpbiA/PSBwYWdlX21hcmdpblxuICBib3R0b21fbWFyZ2luID89IHBhZ2VfbWFyZ2luXG5cbiAgY2FudmFzID0gQ29udGV4dC5jYW52YXMgfHw9XG4gICAgbmV3IENhbnZhcyB3aWR0aCArIGxlZnRfbWFyZ2luICsgcmlnaHRfbWFyZ2luLCBoZWlnaHQgKyB0b3BfbWFyZ2luICsgYm90dG9tX21hcmdpbiwgTW9kZVxuICBjdHggPSBDb250ZXh0LmN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpXG4gIGN0eC50ZXh0RHJhd2luZ01vZGUgPSAnZ2x5cGgnIGlmIE1vZGUgPT0gJ3BkZidcbiAgYm94ZXMgPSBbXVxuXG4gIHRyeVxuICAgIHBhZ2UgPVxuICAgICAgbGVmdF9tYXJnaW46IGxlZnRfbWFyZ2luXG4gICAgICB0b3BfbWFyZ2luOiB0b3BfbWFyZ2luXG4gICAgICByaWdodF9tYXJnaW46IHJpZ2h0X21hcmdpblxuICAgICAgYm90dG9tX21hcmdpbjogYm90dG9tX21hcmdpblxuICAgICAgd2lkdGg6IGNhbnZhcy53aWR0aFxuICAgICAgaGVpZ2h0OiBjYW52YXMuaGVpZ2h0XG4gICAgICBjb250ZXh0OiBjdHhcbiAgICAgIGJveDogKG9wdGlvbnMpIC0+XG4gICAgICAgIGJveGVzLnB1c2ggYm94KG9wdGlvbnMpXG4gICAgQ3VycmVudFBhZ2UgPSBwYWdlXG5cbiAgICBlcmFzZV9iYWNrZ3JvdW5kKClcblxuICAgIHdpdGhHcmFwaGljc0NvbnRleHQgKGN0eCkgLT5cbiAgICAgIGN0eC50cmFuc2xhdGUgbGVmdF9tYXJnaW4sIGJvdHRvbV9tYXJnaW5cbiAgICAgIEN1cnJlbnRCb29rPy5oZWFkZXI/IHBhZ2VcbiAgICAgIEN1cnJlbnRCb29rPy5mb290ZXI/IHBhZ2VcbiAgICAgIGRyYXdfcGFnZT8gcGFnZVxuICAgICAgVERMUkxheW91dCBib3hlc1xuXG4gICAgc3dpdGNoIE1vZGVcbiAgICAgIHdoZW4gJ3BkZicgdGhlbiBjdHguYWRkUGFnZSgpXG4gICAgICBlbHNlXG4gICAgICAgIGZpbGVuYW1lID0gXCIje0RlZmF1bHRGaWxlbmFtZSBvciAndGVzdCd9LnBuZ1wiXG4gICAgICAgIGZzLndyaXRlRmlsZSBwYXRoLmpvaW4oQnVpbGREaXJlY3RvcnksIGZpbGVuYW1lKSwgY2FudmFzLnRvQnVmZmVyKClcbiAgICAgICAgY29uc29sZS5pbmZvIFwiU2F2ZWQgI3tmaWxlbmFtZX1cIlxuICBmaW5hbGx5XG4gICAgQ3VycmVudFBhZ2UgPSBudWxsXG5cbndpdGhHcmlkID0gKG9wdGlvbnMsIGNiKSAtPlxuICBkZWZhdWx0cyA9IHtndXR0ZXJfd2lkdGg6IDEwLCBndXR0ZXJfaGVpZ2h0OiAxMCwgaGVhZGVyX2hlaWdodDogMH1cbiAgb3B0aW9ucyA9IF8uZXh0ZW5kIGRlZmF1bHRzLCBvcHRpb25zXG4gIHtjb2xzLCByb3dzLCBjZWxsX3dpZHRoLCBjZWxsX2hlaWdodCwgaGVhZGVyX2hlaWdodCwgZ3V0dGVyX3dpZHRoLCBndXR0ZXJfaGVpZ2h0fSA9IG9wdGlvbnNcbiAgb3B0aW9ucy53aWR0aCB8fD0gY29scyAqIGNlbGxfd2lkdGggKyAoY29scyAtIDEpICogZ3V0dGVyX3dpZHRoXG4gIG9wdGlvbnMuaGVpZ2h0IHx8PSAgaGVhZGVyX2hlaWdodCArIHJvd3MgKiBjZWxsX2hlaWdodCArIChyb3dzIC0gMSkgKiBndXR0ZXJfaGVpZ2h0XG4gIG92ZXJmbG93ID0gW11cbiAgd2l0aFBhZ2Ugb3B0aW9ucywgKHBhZ2UpIC0+XG4gICAgY2JcbiAgICAgIGNvbnRleHQ6IHBhZ2UuY29udGV4dFxuICAgICAgcm93czogcm93c1xuICAgICAgY29sczogY29sc1xuICAgICAgcm93OiAwXG4gICAgICBjb2w6IDBcbiAgICAgIGFkZF9jZWxsOiAoZHJhd19mbikgLT5cbiAgICAgICAgW2NvbCwgcm93XSA9IFtAY29sLCBAcm93XVxuICAgICAgICBpZiByb3cgPj0gcm93c1xuICAgICAgICAgIG92ZXJmbG93LnB1c2gge2NvbCwgcm93LCBkcmF3X2ZufVxuICAgICAgICBlbHNlXG4gICAgICAgICAgd2l0aEdyYXBoaWNzQ29udGV4dCAoY3R4KSAtPlxuICAgICAgICAgICAgY3R4LnRyYW5zbGF0ZSBjb2wgKiAoY2VsbF93aWR0aCArIGd1dHRlcl93aWR0aCksIGhlYWRlcl9oZWlnaHQgKyByb3cgKiAoY2VsbF9oZWlnaHQgKyBndXR0ZXJfaGVpZ2h0KVxuICAgICAgICAgICAgZHJhd19mbigpXG4gICAgICAgIGNvbCArPSAxXG4gICAgICAgIFtjb2wsIHJvd10gPSBbMCwgcm93ICsgMV0gaWYgY29sID49IGNvbHNcbiAgICAgICAgW0Bjb2wsIEByb3ddID0gW2NvbCwgcm93XVxuICAgICAgc3RhcnRSb3c6IC0+XG4gICAgICAgIFtAY29sLCBAcm93XSA9IFswLCBAcm93ICsgMV0gaWYgQGNvbCA+IDBcbiAgd2hpbGUgb3ZlcmZsb3cubGVuZ3RoXG4gICAgY2VsbC5yb3cgLT0gcm93cyBmb3IgY2VsbCBpbiBvdmVyZmxvd1xuICAgIHdpdGhQYWdlIG9wdGlvbnMsIChwYWdlKSAtPlxuICAgICAgZm9yIHtjb2wsIHJvdywgZHJhd19mbn0gaW4gXy5zZWxlY3Qob3ZlcmZsb3csIChjZWxsKSAtPiBjZWxsLnJvdyA8IHJvd3MpXG4gICAgICAgIHdpdGhHcmFwaGljc0NvbnRleHQgKGN0eCkgLT5cbiAgICAgICAgICBjdHgudHJhbnNsYXRlIGNvbCAqIChjZWxsX3dpZHRoICsgZ3V0dGVyX3dpZHRoKSwgaGVhZGVyX2hlaWdodCArIHJvdyAqIChjZWxsX2hlaWdodCArIGd1dHRlcl9oZWlnaHQpXG4gICAgICAgICAgZHJhd19mbigpXG4gICAgb3ZlcmZsb3cgPSAoY2VsbCBmb3IgY2VsbCBpbiBvdmVyZmxvdyB3aGVuIGNlbGwucm93ID49IHJvd3MpXG5cbndpdGhCb29rID0gKGZpbGVuYW1lLCBvcHRpb25zLCBjYikgLT5cbiAgdGhyb3cgbmV3IEVycm9yIFwid2l0aEJvb2sgY2FsbGVkIHJlY3Vyc2l2ZWx5XCIgaWYgQ3VycmVudEJvb2tcbiAgW29wdGlvbnMsIGNiXSA9IFt7fSwgb3B0aW9uc10gaWYgXy5pc0Z1bmN0aW9uKG9wdGlvbnMpXG4gIHBhZ2VfbGltaXQgPSBvcHRpb25zLnBhZ2VfbGltaXRcbiAgcGFnZV9jb3VudCA9IDBcblxuICB0cnlcbiAgICBib29rID1cbiAgICAgIHBhZ2Vfb3B0aW9uczoge31cblxuICAgIE1vZGUgPSAncGRmJ1xuICAgIEN1cnJlbnRCb29rID0gYm9va1xuXG4gICAgc2l6ZSA9IG9wdGlvbnMuc2l6ZVxuICAgIGlmIHNpemVcbiAgICAgIHt3aWR0aCwgaGVpZ2h0fSA9IGdldF9wYWdlX3NpemVfZGltZW5zaW9ucyBzaXplXG4gICAgICBfLmV4dGVuZCBib29rLnBhZ2Vfb3B0aW9ucywge3dpZHRoLCBoZWlnaHR9XG4gICAgICBjYW52YXMgPSBDb250ZXh0LmNhbnZhcyB8fD0gbmV3IENhbnZhcyB3aWR0aCwgaGVpZ2h0LCBNb2RlXG4gICAgICBjdHggPSBDb250ZXh0LmN0eCA9IGNhbnZhcy5nZXRDb250ZXh0ICcyZCdcbiAgICAgIGN0eC50ZXh0RHJhd2luZ01vZGUgPSAnZ2x5cGgnIGlmIE1vZGUgPT0gJ3BkZidcblxuICAgIGNiXG4gICAgICBwYWdlX2hlYWRlcjogKGhlYWRlcikgLT4gYm9vay5oZWFkZXIgPSBoZWFkZXJcbiAgICAgIHBhZ2VfZm9vdGVyOiAoZm9vdGVyKSAtPiBib29rLmZvb3RlciA9IGZvb3RlclxuICAgICAgd2l0aFBhZ2U6IChvcHRpb25zLCBkcmF3X3BhZ2UpIC0+XG4gICAgICAgIFtvcHRpb25zLCBkcmF3X3BhZ2VdID0gW3t9LCBvcHRpb25zXSBpZiBfLmlzRnVuY3Rpb24ob3B0aW9ucylcbiAgICAgICAgcmV0dXJuIGlmIEBkb25lXG4gICAgICAgIG9wdGlvbnMgPSBfLmV4dGVuZCB7fSwgYm9vay5wYWdlX29wdGlvbnMsIG9wdGlvbnNcbiAgICAgICAgcGFnZV9jb3VudCArPSAxXG4gICAgICAgIGlmIEN1cnJlbnRQYWdlXG4gICAgICAgICAgZHJhd19wYWdlIEN1cnJlbnRQYWdlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICB3aXRoUGFnZSBvcHRpb25zLCBkcmF3X3BhZ2VcbiAgICAgICAgQGRvbmUgPSB0cnVlIGlmIHBhZ2VfbGltaXQgYW5kIHBhZ2VfbGltaXQgPD0gcGFnZV9jb3VudFxuXG4gICAgaWYgY2FudmFzXG4gICAgICB3cml0ZV9wZGYgY2FudmFzLCBwYXRoLmpvaW4oQnVpbGREaXJlY3RvcnksIFwiI3tmaWxlbmFtZX0ucGRmXCIpXG4gICAgZWxzZVxuICAgICAgY29uc29sZS53YXJuIFwiTm8gcGFnZXNcIlxuICBmaW5hbGx5XG4gICAgQ3VycmVudEJvb2sgPSBudWxsXG4gICAgTW9kZSA9IG51bGxcbiAgICBjYW52YXMgPSBudWxsXG4gICAgY3R4ID0gbnVsbFxuXG53cml0ZV9wZGYgPSAoY2FudmFzLCBwYXRobmFtZSkgLT5cbiAgZnMud3JpdGVGaWxlIHBhdGhuYW1lLCBjYW52YXMudG9CdWZmZXIoKSwgKGVycikgLT5cbiAgICBpZiBlcnJcbiAgICAgIGNvbnNvbGUuZXJyb3IgXCJFcnJvciAje2Vyci5jb2RlfSB3cml0aW5nIHRvICN7ZXJyLnBhdGh9XCJcbiAgICBlbHNlXG4gICAgICBjb25zb2xlLmluZm8gXCJTYXZlZCAje3BhdGhuYW1lfVwiXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBQYXBlclNpemVzXG4gIGFib3ZlXG4gIHdpdGhCb29rXG4gIHdpdGhHcmlkXG4gIHdpdGhHcmlkQm94ZXNcblxuICBkcmF3VGV4dFxuICBib3hcbiAgaGJveFxuXG4gIHRleHRCb3hcbiAgbGFiZWxlZFxuICBtZWFzdXJlX3RleHRcbiAgZGlyZWN0b3J5XG4gIGZpbGVuYW1lXG4gIHdpdGhHcmFwaGljc0NvbnRleHRcbiAgd2l0aENhbnZhc1xufVxuIiwie1BJLCBjb3MsIHNpbiwgbWluLCBtYXh9ID0gTWF0aFxuQ2hvcmREaWFncmFtU3R5bGUgPSByZXF1aXJlKCcuL2Nob3JkX2RpYWdyYW0nKS5kZWZhdWx0U3R5bGVcbntibG9jaywgd2l0aEdyYXBoaWNzQ29udGV4dH0gPSByZXF1aXJlICcuL2xheW91dCdcblxuZHJhd19waXRjaF9kaWFncmFtID0gKGN0eCwgcGl0Y2hDbGFzc2VzLCBvcHRpb25zPXtkcmF3OiB0cnVlfSkgLT5cbiAge3BpdGNoX2NvbG9ycywgcGl0Y2hfbmFtZXN9ID0gb3B0aW9uc1xuICBwaXRjaF9jb2xvcnMgfHw9IENob3JkRGlhZ3JhbVN0eWxlLmludGVydmFsX2NsYXNzX2NvbG9yc1xuICBwaXRjaF9uYW1lcyB8fD0gJ1IgbTIgTTIgbTMgTTMgUDQgVFQgUDUgbTYgTTYgbTcgTTcnLnNwbGl0KC9cXHMvKVxuICAjIHBpdGNoX25hbWVzID0gJzEgMmIgMiAzYiAzIDQgVCA1IDZiIDYgN2IgNycuc3BsaXQoL1xccy8pXG4gIHIgPSAxMFxuICByX2xhYmVsID0gciArIDdcblxuICBwaXRjaF9jbGFzc19hbmdsZSA9IChwaXRjaENsYXNzKSAtPlxuICAgIChwaXRjaENsYXNzIC0gMykgKiAyICogUEkgLyAxMlxuXG4gIGJvdW5kcyA9IHtsZWZ0OiAwLCB0b3A6IDAsIHJpZ2h0OiAwLCBib3R0b206IDB9XG4gIGV4dGVuZF9ib3VuZHMgPSAobGVmdCwgdG9wLCBib3R0b20sIHJpZ2h0KSAtPlxuICAgICMgcmlnaHQgPz0gbGVmdFxuICAgICMgYm90dG9tID89IHRvcFxuICAgIGJvdW5kcy5sZWZ0ID0gbWluIGJvdW5kcy5sZWZ0LCBsZWZ0XG4gICAgYm91bmRzLnRvcCA9IG1pbiBib3VuZHMudG9wLCB0b3BcbiAgICBib3VuZHMucmlnaHQgPSBtYXggYm91bmRzLnJpZ2h0LCByaWdodCA/IGxlZnRcbiAgICBib3VuZHMuYm90dG9tID0gbWF4IGJvdW5kcy5ib3R0b20sIGJvdHRvbSA/IHRvcFxuXG4gIGZvciBwaXRjaENsYXNzIGluIHBpdGNoQ2xhc3Nlc1xuICAgIGFuZ2xlID0gcGl0Y2hfY2xhc3NfYW5nbGUgcGl0Y2hDbGFzc1xuICAgIHggPSByICogY29zKGFuZ2xlKVxuICAgIHkgPSByICogc2luKGFuZ2xlKVxuXG4gICAgaWYgb3B0aW9ucy5kcmF3XG4gICAgICBjdHguYmVnaW5QYXRoKClcbiAgICAgIGN0eC5tb3ZlVG8gMCwgMFxuICAgICAgY3R4LmxpbmVUbyB4LCB5XG4gICAgICBjdHguc3Ryb2tlKClcbiAgICBleHRlbmRfYm91bmRzIHgsIHlcblxuICAgIGlmIG9wdGlvbnMuZHJhd1xuICAgICAgY3R4LmJlZ2luUGF0aCgpXG4gICAgICBjdHguYXJjIHgsIHksIDIsIDAsIDIgKiBQSSwgZmFsc2VcbiAgICAgIGN0eC5maWxsU3R5bGUgPSBwaXRjaF9jb2xvcnNbcGl0Y2hDbGFzc10gb3IgJ2JsYWNrJ1xuICAgICAgY3R4LmZpbGwoKVxuXG4gIGN0eC5mb250ID0gJzRwdCBUaW1lcydcbiAgY3R4LmZpbGxTdHlsZSA9ICdibGFjaydcbiAgZm9yIGNsYXNzX25hbWUsIHBpdGNoQ2xhc3MgaW4gcGl0Y2hfbmFtZXNcbiAgICBhbmdsZSA9IHBpdGNoX2NsYXNzX2FuZ2xlIHBpdGNoQ2xhc3NcbiAgICBtID0gY3R4Lm1lYXN1cmVUZXh0IGNsYXNzX25hbWVcbiAgICB4ID0gcl9sYWJlbCAqIGNvcyhhbmdsZSkgLSBtLndpZHRoIC8gMlxuICAgIHkgPSByX2xhYmVsICogc2luKGFuZ2xlKSArIG0uZW1IZWlnaHREZXNjZW50XG4gICAgY3R4LmZpbGxUZXh0IGNsYXNzX25hbWUsIHgsIHkgaWYgb3B0aW9ucy5kcmF3XG4gICAgYm91bmRzLmxlZnQgPSBtaW4gYm91bmRzLmxlZnQsIHhcbiAgICBib3VuZHMucmlnaHQgPSBtYXggYm91bmRzLnJpZ2h0LCB4ICsgbS53aWR0aFxuICAgIGJvdW5kcy50b3AgPSBtaW4gYm91bmRzLnRvcCwgeSAtIG0uZW1IZWlnaHRBc2NlbnRcbiAgICBib3VuZHMuYm90dG9tID0gbWF4IGJvdW5kcy5ib3R0b20sIHkgKyBtLmVtSGVpZ2h0QXNjZW50XG5cbiAgcmV0dXJuIGJvdW5kc1xuXG5waXRjaF9kaWFncmFtX2Jsb2NrID0gKHBpdGNoQ2xhc3Nlcywgc2NhbGU9MSkgLT5cbiAgYm91bmRzID0gd2l0aEdyYXBoaWNzQ29udGV4dCAoY3R4KSAtPiBkcmF3X3BpdGNoX2RpYWdyYW0gY3R4LCBwaXRjaENsYXNzZXMsIGRyYXc6IGZhbHNlLCBtZWFzdXJlOiB0cnVlXG4gIGJsb2NrXG4gICAgd2lkdGg6IChib3VuZHMucmlnaHQgLSBib3VuZHMubGVmdCkgKiBzY2FsZVxuICAgIGhlaWdodDogKGJvdW5kcy5ib3R0b20gLSBib3VuZHMudG9wKSAqIHNjYWxlXG4gICAgZHJhdzogLT5cbiAgICAgIHdpdGhHcmFwaGljc0NvbnRleHQgKGN0eCkgLT5cbiAgICAgICAgY3R4LnNjYWxlIHNjYWxlLCBzY2FsZVxuICAgICAgICBjdHgudHJhbnNsYXRlIC1ib3VuZHMubGVmdCwgLWJvdW5kcy5ib3R0b21cbiAgICAgICAgZHJhd19waXRjaF9kaWFncmFtIGN0eCwgcGl0Y2hDbGFzc2VzXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgZHJhdzogZHJhd19waXRjaF9kaWFncmFtXG4gIGJsb2NrOiBwaXRjaF9kaWFncmFtX2Jsb2NrXG4iLCIjXG4jIE5vdGVzIGFuZCBQaXRjaGVzXG4jXG5cblNoYXJwTm90ZU5hbWVzID0gJ0MgQyMgRCBEIyBFIEYgRiMgRyBHIyBBIEEjIEInLnJlcGxhY2UoLyMvZywgJ1xcdTI2NkYnKS5zcGxpdCgvXFxzLylcbkZsYXROb3RlTmFtZXMgPSAnQyBEYiBEIEViIEUgRiBHYiBHIEFiIEEgQmIgQicucmVwbGFjZSgvYi9nLCAnXFx1MjY2RCcpLnNwbGl0KC9cXHMvKVxuTm90ZU5hbWVzID0gU2hhcnBOb3RlTmFtZXNcblxuQWNjaWRlbnRhbFZhbHVlcyA9XG4gICcjJzogMVxuICAn4pmvJzogMVxuICAnYic6IC0xXG4gICfima0nOiAtMVxuICAn8J2Eqic6IDJcbiAgJ/CdhKsnOiAtMlxuXG5JbnRlcnZhbE5hbWVzID0gWydQMScsICdtMicsICdNMicsICdtMycsICdNMycsICdQNCcsICdUVCcsICdQNScsICdtNicsICdNNicsICdtNycsICdNNycsICdQOCddXG5cbkxvbmdJbnRlcnZhbE5hbWVzID0gW1xuICAnVW5pc29uJywgJ01pbm9yIDJuZCcsICdNYWpvciAybmQnLCAnTWlub3IgM3JkJywgJ01ham9yIDNyZCcsICdQZXJmZWN0IDR0aCcsXG4gICdUcml0b25lJywgJ1BlcmZlY3QgNXRoJywgJ01pbm9yIDZ0aCcsICdNYWpvciA2dGgnLCAnTWlub3IgN3RoJywgJ01ham9yIDd0aCcsICdPY3RhdmUnXVxuXG5nZXRQaXRjaENsYXNzTmFtZSA9IChwaXRjaENsYXNzKSAtPlxuICBOb3RlTmFtZXNbbm9ybWFsaXplUGl0Y2hDbGFzcyhwaXRjaENsYXNzKV1cblxuZ2V0UGl0Y2hOYW1lID0gKHBpdGNoKSAtPlxuICByZXR1cm4gcGl0Y2ggaWYgdHlwZW9mIHBpdGNoID09ICdzdHJpbmcnXG4gIGdldFBpdGNoQ2xhc3NOYW1lKHBpdGNoKVxuXG4jIFRoZSBpbnRlcnZhbCBjbGFzcyAoaW50ZWdlciBpbiBbMC4uLjEyXSkgYmV0d2VlbiB0d28gcGl0Y2ggY2xhc3MgbnVtYmVyc1xuaW50ZXJ2YWxDbGFzc0RpZmZlcmVuY2UgPSAocGNhLCBwY2IpIC0+XG4gIG5vcm1hbGl6ZVBpdGNoQ2xhc3MocGNiIC0gcGNhKVxuXG5ub3JtYWxpemVQaXRjaENsYXNzID0gKHBpdGNoQ2xhc3MpIC0+XG4gICgocGl0Y2hDbGFzcyAlIDEyKSArIDEyKSAlIDEyXG5cbnBpdGNoRnJvbVNjaWVudGlmaWNOb3RhdGlvbiA9IChuYW1lKSAtPlxuICBtYXRjaCA9IG5hbWUubWF0Y2goL14oW0EtR10pKFsj4pmvYuKZrfCdhKrwnYSrXSopKFxcZCspJC9pKVxuICB0aHJvdyBuZXcgRXJyb3IoXCIje25hbWV9IGlzIG5vdCBpbiBzY2llbnRpZmljIG5vdGF0aW9uXCIpIHVubGVzcyBtYXRjaFxuICBbbmF0dXJhbE5hbWUsIGFjY2lkZW50YWxzLCBvY3RhdmVdID0gbWF0Y2hbMS4uLl1cbiAgcGl0Y2ggPSBTaGFycE5vdGVOYW1lcy5pbmRleE9mKG5hdHVyYWxOYW1lLnRvVXBwZXJDYXNlKCkpICsgMTIgKiAoMSArIE51bWJlcihvY3RhdmUpKVxuICBwaXRjaCArPSBBY2NpZGVudGFsVmFsdWVzW2NdIGZvciBjIGluIGFjY2lkZW50YWxzXG4gIHJldHVybiBwaXRjaFxuXG5wYXJzZVBpdGNoQ2xhc3MgPSAobmFtZSkgLT5cbiAgbWF0Y2ggPSBuYW1lLm1hdGNoKC9eKFtBLUddKShbI+KZr2Lima3wnYSq8J2Eq10qKSQvaSlcbiAgdGhyb3cgbmV3IEVycm9yKFwiI3tuYW1lfSBpcyBub3QgYSBwaXRjaCBjbGFzcyBuYW1lXCIpIHVubGVzcyBtYXRjaFxuICBbbmF0dXJhbE5hbWUsIGFjY2lkZW50YWxzXSA9IG1hdGNoWzEuLi5dXG4gIHBpdGNoID0gU2hhcnBOb3RlTmFtZXMuaW5kZXhPZihuYXR1cmFsTmFtZS50b1VwcGVyQ2FzZSgpKVxuICBwaXRjaCArPSBBY2NpZGVudGFsVmFsdWVzW2NdIGZvciBjIGluIGFjY2lkZW50YWxzXG4gIHJldHVybiBwaXRjaFxuXG5cbiNcbiMgU2NhbGVzXG4jXG5cbmNsYXNzIFNjYWxlXG4gIGNvbnN0cnVjdG9yOiAoe0BuYW1lLCBAcGl0Y2hlcywgQHRvbmljTmFtZX0pIC0+XG4gICAgQHRvbmljUGl0Y2ggb3I9IHBhcnNlUGl0Y2hDbGFzcyhAdG9uaWNOYW1lKSBpZiBAdG9uaWNOYW1lXG5cbiAgYXQ6ICh0b25pY05hbWUpIC0+XG4gICAgbmV3IFNjYWxlXG4gICAgICBuYW1lOiBAbmFtZVxuICAgICAgcGl0Y2hlczogQHBpdGNoZXNcbiAgICAgIHRvbmljTmFtZTogdG9uaWNOYW1lXG5cbiAgY2hvcmRzOiAob3B0aW9ucz17fSkgLT5cbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJvbmx5IGltcGxlbWVudGVkIGZvciBzY2FsZXMgd2l0aCB0b25pY3NcIikgdW5sZXNzIEB0b25pY1BpdGNoP1xuICAgIG5vdGVOYW1lcyA9IFNoYXJwTm90ZU5hbWVzXG4gICAgbm90ZU5hbWVzID0gRmxhdE5vdGVOYW1lcyBpZiBub3RlTmFtZXMuaW5kZXhPZihAdG9uaWNOYW1lKSA8IDAgb3IgQHRvbmljTmFtZSA9PSAnRidcbiAgICBkZWdyZWVzID0gWzAsIDIsIDRdXG4gICAgZGVncmVlcy5wdXNoIDYgaWYgb3B0aW9ucy5zZXZlbnRoc1xuICAgIGZvciBpIGluIFswLi4uQHBpdGNoZXMubGVuZ3RoXVxuICAgICAgcGl0Y2hlcyA9IEBwaXRjaGVzW2kuLl0uY29uY2F0KEBwaXRjaGVzWy4uLmldKVxuICAgICAgcGl0Y2hlcyA9IChwaXRjaGVzW2RlZ3JlZV0gZm9yIGRlZ3JlZSBpbiBkZWdyZWVzKS5tYXAgKG4pID0+IChuICsgQHRvbmljUGl0Y2gpICUgMTJcbiAgICAgIENob3JkLmZyb21QaXRjaGVzKHBpdGNoZXMpLmVuaGFybW9uaWNpemVUbyhub3RlTmFtZXMpXG5cbiAgQGZpbmQ6ICh0b25pY05hbWUpIC0+XG4gICAgc2NhbGVOYW1lID0gJ0RpYXRvbmljIE1ham9yJ1xuICAgIFNjYWxlc1tzY2FsZU5hbWVdLmF0KHRvbmljTmFtZSlcblxuU2NhbGVzID0gZG8gLT5cbiAgc2NhbGVfc3BlY3MgPSBbXG4gICAgJ0RpYXRvbmljIE1ham9yOiAwMjQ1NzllJ1xuICAgICdOYXR1cmFsIE1pbm9yOiAwMjM1Nzh0J1xuICAgICdNZWxvZGljIE1pbm9yOiAwMjM1NzllJ1xuICAgICdIYXJtb25pYyBNaW5vcjogMDIzNTc4ZSdcbiAgICAnUGVudGF0b25pYyBNYWpvcjogMDI0NzknXG4gICAgJ1BlbnRhdG9uaWMgTWlub3I6IDAzNTd0J1xuICAgICdCbHVlczogMDM1Njd0J1xuICAgICdGcmV5Z2lzaDogMDE0NTc4dCdcbiAgICAnV2hvbGUgVG9uZTogMDI0Njh0J1xuICAgICMgJ09jdGF0b25pYycgaXMgdGhlIGNsYXNzaWNhbCBuYW1lLiBJdCdzIHRoZSBqYXp6ICdEaW1pbmlzaGVkJyBzY2FsZS5cbiAgICAnT2N0YXRvbmljOiAwMjM1Njg5ZSdcbiAgXVxuICBmb3Igc3BlYyBpbiBzY2FsZV9zcGVjc1xuICAgIFtuYW1lLCBwaXRjaGVzXSA9IHNwZWMuc3BsaXQoLzpcXHMqLywgMilcbiAgICBwaXRjaGVzID0gcGl0Y2hlcy5tYXRjaCgvLi9nKS5tYXAgKGMpIC0+IHsndCc6MTAsICdlJzoxMX1bY10gb3IgTnVtYmVyKGMpXG4gICAgbmV3IFNjYWxlIHtuYW1lLCBwaXRjaGVzfVxuXG5kbyAtPlxuICBTY2FsZXNbc2NhbGUubmFtZV0gPSBzY2FsZSBmb3Igc2NhbGUgaW4gU2NhbGVzXG5cbk1vZGVzID0gZG8gLT5cbiAgcm9vdFRvbmVzID0gU2NhbGVzWydEaWF0b25pYyBNYWpvciddLnBpdGNoZXNcbiAgbW9kZU5hbWVzID0gJ0lvbmlhbiBEb3JpYW4gUGhyeWdpYW4gTHlkaWFuIE1peG9seWRpYW4gQWVvbGlhbiBMb2NyaWFuJy5zcGxpdCgvXFxzLylcbiAgZm9yIGRlbHRhLCBpIGluIHJvb3RUb25lc1xuICAgIG5hbWUgPSBtb2RlTmFtZXNbaV1cbiAgICBwaXRjaGVzID0gKChkIC0gZGVsdGEgKyAxMikgJSAxMiBmb3IgZCBpbiByb290VG9uZXNbaS4uLl0uY29uY2F0IHJvb3RUb25lc1suLi5pXSlcbiAgICBuZXcgU2NhbGUge25hbWUsIHBpdGNoZXN9XG5cbmRvIC0+XG4gIE1vZGVzW21vZGUubmFtZV0gPSBtb2RlIGZvciBtb2RlIGluIE1vZGVzXG5cbiMgSW5kZXhlZCBieSBzY2FsZSBkZWdyZWVcbkZ1bmN0aW9ucyA9ICdUb25pYyBTdXBlcnRvbmljIE1lZGlhbnQgU3ViZG9taW5hbnQgRG9taW5hbnQgU3VibWVkaWFudCBTdWJ0b25pYyBMZWFkaW5nJy5zcGxpdCgvXFxzLylcblxucGFyc2VDaG9yZE51bWVyYWwgPSAobmFtZSkgLT5cbiAgY2hvcmQgPSB7XG4gICAgZGVncmVlOiAnaSBpaSBpaWkgaXYgdiB2aSB2aWknLmluZGV4T2YobmFtZS5tYXRjaCgvW2l2K10vaSlbMV0pICsgMVxuICAgIG1ham9yOiBuYW1lID09IG5hbWUudG9VcHBlckNhc2UoKVxuICAgIGZsYXQ6IG5hbWUubWF0Y2goL15iLylcbiAgICBkaW1pbmlzaGVkOiBuYW1lLm1hdGNoKC/CsC8pXG4gICAgYXVnbWVudGVkOiBuYW1lLm1hdGNoKC9cXCsvKVxuICB9XG4gIHJldHVybiBjaG9yZFxuXG5GdW5jdGlvblF1YWxpdGllcyA9XG4gIG1ham9yOiAnSSBpaSBpaWkgSVYgViB2aSB2aWnCsCcuc3BsaXQoL1xccy8pLm1hcCBwYXJzZUNob3JkTnVtZXJhbFxuICBtaW5vcjogJ2kgaWnCsCBiSUlJIGl2IHYgYlZJIGJWSUknLnNwbGl0KC9cXHMvKS5tYXAgcGFyc2VDaG9yZE51bWVyYWxcblxuXG4jXG4jIENob3Jkc1xuI1xuXG5jbGFzcyBDaG9yZFxuICBjb25zdHJ1Y3RvcjogKHtAbmFtZSwgQGZ1bGxOYW1lLCBAYWJiciwgQGFiYnJzLCBAcGl0Y2hDbGFzc2VzLCBAcm9vdE5hbWUsIEByb290UGl0Y2h9KSAtPlxuICAgIEBhYmJycyA/PSBbQGFiYnJdXG4gICAgQGFiYnJzID0gQGFiYnJzLnNwbGl0KC9zLykgaWYgdHlwZW9mIEBhYmJycyA9PSAnc3RyaW5nJ1xuICAgIEBhYmJyID89IEBhYmJyc1swXVxuICAgIGlmIEByb290UGl0Y2g/XG4gICAgICBAcm9vdE5hbWUgb3I9IE5vdGVOYW1lc1tAcm9vdFBpdGNoXVxuICAgIGlmIEByb290TmFtZT9cbiAgICAgIEByb290UGl0Y2ggPz0gcGFyc2VQaXRjaENsYXNzKEByb290TmFtZSlcbiAgICAgIHJvb3RsZXNzQWJiciA9IEBhYmJyXG4gICAgICByb290bGVzc0Z1bGxOYW1lID0gQGZ1bGxOYW1lXG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkgdGhpcywgJ25hbWUnLCBnZXQ6IC0+IFwiI3tAcm9vdE5hbWV9I3tyb290bGVzc0FiYnJ9XCJcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSB0aGlzLCAnZnVsbE5hbWUnLCBnZXQ6IC0+IFwiI3tAcm9vdE5hbWV9ICN7cm9vdGxlc3NGdWxsTmFtZX1cIlxuICAgIGRlZ3JlZXMgPSAoMSArIDIgKiBpIGZvciBpIGluIFswLi5AcGl0Y2hDbGFzc2VzLmxlbmd0aF0pXG4gICAgZGVncmVlc1sxXSA9IHsnU3VzMic6MiwgJ1N1czQnOjR9W0BuYW1lXSB8fCBkZWdyZWVzWzFdXG4gICAgZGVncmVlc1szXSA9IDYgaWYgQG5hbWUubWF0Y2ggLzYvXG4gICAgQGNvbXBvbmVudHMgPSBmb3IgcGMsIHBjaSBpbiBAcGl0Y2hDbGFzc2VzXG4gICAgICBuYW1lID0gSW50ZXJ2YWxOYW1lc1twY11cbiAgICAgIGRlZ3JlZSA9IGRlZ3JlZXNbcGNpXVxuICAgICAgaWYgcGMgPT0gMFxuICAgICAgICBuYW1lID0gJ1InXG4gICAgICBlbHNlIHVubGVzcyBOdW1iZXIobmFtZS5tYXRjaCgvXFxkKy8pP1swXSkgPT0gZGVncmVlXG4gICAgICAgIG5hbWUgPSBcIkEje2RlZ3JlZX1cIiBpZiBOdW1iZXIoSW50ZXJ2YWxOYW1lc1twYyAtIDFdLm1hdGNoKC9cXGQrLyk/WzBdKSA9PSBkZWdyZWVcbiAgICAgICAgbmFtZSA9IFwiZCN7ZGVncmVlfVwiIGlmIE51bWJlcihJbnRlcnZhbE5hbWVzW3BjICsgMV0ubWF0Y2goL1xcZCsvKT9bMF0pID09IGRlZ3JlZVxuICAgICAgbmFtZVxuXG4gIGF0OiAocm9vdE5hbWVPclBpdGNoKSAtPlxuICAgIFtyb290TmFtZSwgcm9vdFBpdGNoXSA9IHN3aXRjaCB0eXBlb2Ygcm9vdE5hbWVPclBpdGNoXG4gICAgICB3aGVuICdzdHJpbmcnXG4gICAgICAgIFtyb290TmFtZU9yUGl0Y2gsIG51bGxdXG4gICAgICB3aGVuICdudW1iZXInXG4gICAgICAgIFtudWxsLCByb290TmFtZU9yUGl0Y2hdXG4gICAgICBlbHNlXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIiNyb290TmFtZU9yUGl0Y2h9IG11c3QgYmUgYSBwaXRjaCBuYW1lIG9yIG51bWJlclwiKVxuXG4gICAgbmV3IENob3JkXG4gICAgICBuYW1lOiBAbmFtZVxuICAgICAgYWJicnM6IEBhYmJyc1xuICAgICAgZnVsbE5hbWU6IEBmdWxsTmFtZVxuICAgICAgcGl0Y2hDbGFzc2VzOiBAcGl0Y2hDbGFzc2VzXG4gICAgICByb290TmFtZTogcm9vdE5hbWVcbiAgICAgIHJvb3RQaXRjaDogcm9vdFBpdGNoXG5cbiAgZGVncmVlTmFtZTogKGRlZ3JlZUluZGV4KSAtPlxuICAgIEBjb21wb25lbnRzW2RlZ3JlZUluZGV4XVxuXG4gIGVuaGFybW9uaWNpemVUbzogKHBpdGNoTmFtZUFycmF5KSAtPlxuICAgIGZvciBwaXRjaE5hbWUsIHBpdGNoQ2xhc3MgaW4gcGl0Y2hOYW1lQXJyYXlcbiAgICAgIEByb290TmFtZSA9IHBpdGNoTmFtZSBpZiBAcm9vdFBpdGNoID09IHBpdGNoQ2xhc3NcbiAgICByZXR1cm4gdGhpc1xuXG4gIEBmaW5kOiAobmFtZSkgLT5cbiAgICBtYXRjaCA9IG5hbWUubWF0Y2goL14oW2EtZ0EtR11bI2Lima/ima1dKikoLiopJC8pXG4gICAgdGhyb3cgbmV3IEVycm9yKFwiI3tuYW1lfSBpcyBub3QgYSBjaG9yZCBuYW1lXCIpIHVubGVzcyBtYXRjaFxuICAgIFtub3RlTmFtZSwgY2hvcmROYW1lXSA9IG1hdGNoWzEuLi5dXG4gICAgdGhyb3cgbmV3IEVycm9yKFwiI3tuYW1lfSBpcyBub3QgYSBjaG9yZCBuYW1lXCIpIHVubGVzcyBDaG9yZHNbY2hvcmROYW1lXVxuICAgIHJldHVybiBDaG9yZHNbY2hvcmROYW1lXS5hdChub3RlTmFtZSlcblxuICBAZnJvbVBpdGNoZXM6IChwaXRjaGVzKSAtPlxuICAgIHJvb3QgPSBwaXRjaGVzWzBdXG4gICAgQ2hvcmQuZnJvbVBpdGNoQ2xhc3NlcyhwaXRjaCAtIHJvb3QgZm9yIHBpdGNoIGluIHBpdGNoZXMpLmF0KHJvb3QpXG5cbiAgQGZyb21QaXRjaENsYXNzZXM6IChwaXRjaENsYXNzZXMpIC0+XG4gICAgcGl0Y2hDbGFzc2VzID0gKChuICsgMTIpICUgMTIgZm9yIG4gaW4gcGl0Y2hDbGFzc2VzKS5zb3J0KChhLCBiKSAtPiBhID4gYilcbiAgICBjaG9yZCA9IENob3Jkc1twaXRjaENsYXNzZXNdXG4gICAgdGhyb3cgbmV3IEVycm9yKFwiQ291bGRuJyd0IGZpbmQgY2hvcmQgd2l0aCBwaXRjaCBjbGFzc2VzICN7cGl0Y2hDbGFzc2VzfVwiKSB1bmxlc3MgY2hvcmRcbiAgICByZXR1cm4gY2hvcmRcblxuXG5DaG9yZERlZmluaXRpb25zID0gW1xuICB7bmFtZTogJ01ham9yJywgYWJicnM6IFsnJywgJ00nXSwgcGl0Y2hDbGFzc2VzOiAnMDQ3J30sXG4gIHtuYW1lOiAnTWlub3InLCBhYmJyOiAnbScsIHBpdGNoQ2xhc3NlczogJzAzNyd9LFxuICB7bmFtZTogJ0F1Z21lbnRlZCcsIGFiYnJzOiBbJysnLCAnYXVnJ10sIHBpdGNoQ2xhc3NlczogJzA0OCd9LFxuICB7bmFtZTogJ0RpbWluaXNoZWQnLCBhYmJyczogWyfCsCcsICdkaW0nXSwgcGl0Y2hDbGFzc2VzOiAnMDM2J30sXG4gIHtuYW1lOiAnU3VzMicsIGFiYnI6ICdzdXMyJywgcGl0Y2hDbGFzc2VzOiAnMDI3J30sXG4gIHtuYW1lOiAnU3VzNCcsIGFiYnI6ICdzdXM0JywgcGl0Y2hDbGFzc2VzOiAnMDU3J30sXG4gIHtuYW1lOiAnRG9taW5hbnQgN3RoJywgYWJicnM6IFsnNycsICdkb203J10sIHBpdGNoQ2xhc3NlczogJzA0N3QnfSxcbiAge25hbWU6ICdBdWdtZW50ZWQgN3RoJywgYWJicnM6IFsnKzcnLCAnN2F1ZyddLCBwaXRjaENsYXNzZXM6ICcwNDh0J30sXG4gIHtuYW1lOiAnRGltaW5pc2hlZCA3dGgnLCBhYmJyczogWyfCsDcnLCAnZGltNyddLCBwaXRjaENsYXNzZXM6ICcwMzY5J30sXG4gIHtuYW1lOiAnTWFqb3IgN3RoJywgYWJicjogJ21hajcnLCBwaXRjaENsYXNzZXM6ICcwNDdlJ30sXG4gIHtuYW1lOiAnTWlub3IgN3RoJywgYWJicjogJ21pbjcnLCBwaXRjaENsYXNzZXM6ICcwMzd0J30sXG4gIHtuYW1lOiAnRG9taW5hbnQgN2I1JywgYWJicjogJzdiNScsIHBpdGNoQ2xhc3NlczogJzA0NnQnfSxcbiAgIyBmb2xsb3dpbmcgaXMgYWxzbyBoYWxmLWRpbWluaXNoZWQgN3RoXG4gIHtuYW1lOiAnTWlub3IgN3RoIGI1JywgYWJicnM6IFsnw7gnLCAnw5gnLCAnbTdiNSddLCBwaXRjaENsYXNzZXM6ICcwMzZ0J30sXG4gIHtuYW1lOiAnRGltaW5pc2hlZCBNYWogN3RoJywgYWJicjogJ8KwTWFqNycsIHBpdGNoQ2xhc3NlczogJzAzNmUnfSxcbiAge25hbWU6ICdNaW5vci1NYWpvciA3dGgnLCBhYmJyczogWydtaW4vbWFqNycsICdtaW4obWFqNyknXSwgcGl0Y2hDbGFzc2VzOiAnMDM3ZSd9LFxuICB7bmFtZTogJzZ0aCcsIGFiYnJzOiBbJzYnLCAnTTYnLCAnTTYnLCAnbWFqNiddLCBwaXRjaENsYXNzZXM6ICcwNDc5J30sXG4gIHtuYW1lOiAnTWlub3IgNnRoJywgYWJicnM6IFsnbTYnLCAnbWluNiddLCBwaXRjaENsYXNzZXM6ICcwMzc5J30sXG5dXG5cbiMgQ2hvcmRzIGlzIGFuIGFycmF5IG9mIGNob3JkIGNsYXNzZXNcbkNob3JkcyA9IENob3JkRGVmaW5pdGlvbnMubWFwIChzcGVjKSAtPlxuICBzcGVjLmZ1bGxOYW1lID0gc3BlYy5uYW1lXG4gIHNwZWMubmFtZSA9IHNwZWMubmFtZVxuICAgIC5yZXBsYWNlKC9NYWpvcig/ISQpLywgJ01haicpXG4gICAgLnJlcGxhY2UoL01pbm9yKD8hJCkvLCAnTWluJylcbiAgICAucmVwbGFjZSgnRG9taW5hbnQnLCAnRG9tJylcbiAgICAucmVwbGFjZSgnRGltaW5pc2hlZCcsICdEaW0nKVxuICBzcGVjLmFiYnJzIG9yPSBbc3BlYy5hYmJyXVxuICBzcGVjLmFiYnJzID0gc3BlYy5hYmJycy5zcGxpdCgvcy8pIGlmIHR5cGVvZiBzcGVjLmFiYnJzID09ICdzdHJpbmcnXG4gIHNwZWMuYWJiciBvcj0gc3BlYy5hYmJyc1swXVxuICBzcGVjLnBpdGNoQ2xhc3NlcyA9IHNwZWMucGl0Y2hDbGFzc2VzLm1hdGNoKC8uL2cpLm1hcCAoYykgLT4geyd0JzoxMCwgJ2UnOjExfVtjXSBvciBOdW1iZXIoYylcbiAgbmV3IENob3JkIHNwZWNcblxuIyBgQ2hvcmRzYCBpcyBhbHNvIGluZGV4ZWQgYnkgY2hvcmQgbmFtZXMgYW5kIGFiYnJldmlhdGlvbnMsIGFuZCBieSBwaXRjaCBjbGFzc2VzXG5kbyAtPlxuICBmb3IgY2hvcmQgaW4gQ2hvcmRzXG4gICAge25hbWUsIGZ1bGxOYW1lLCBhYmJyc30gPSBjaG9yZFxuICAgIENob3Jkc1trZXldID0gY2hvcmQgZm9yIGtleSBpbiBbbmFtZSwgZnVsbE5hbWVdLmNvbmNhdChhYmJycylcbiAgICBDaG9yZHNbY2hvcmQucGl0Y2hDbGFzc2VzXSA9IGNob3JkXG5cblxuI1xuIyBFeHBvcnRzXG4jXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBDaG9yZFxuICBDaG9yZHNcbiAgSW50ZXJ2YWxOYW1lc1xuICBMb25nSW50ZXJ2YWxOYW1lc1xuICBNb2Rlc1xuICBOb3RlTmFtZXNcbiAgU2NhbGVcbiAgU2NhbGVzXG4gIGdldFBpdGNoQ2xhc3NOYW1lXG4gIGludGVydmFsQ2xhc3NEaWZmZXJlbmNlXG4gIHBpdGNoRnJvbVNjaWVudGlmaWNOb3RhdGlvblxufVxuIiwiRnVuY3Rpb246OmRlZmluZSB8fD0gKG5hbWUsIGRlc2MpIC0+XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSBAcHJvdG90eXBlLCBuYW1lLCBkZXNjXG5cbkZ1bmN0aW9uOjpjYWNoZWRfZ2V0dGVyIHx8PSAobmFtZSwgZm4pIC0+XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSBAcHJvdG90eXBlLCBuYW1lLCBnZXQ6IC0+XG4gICAgY2FjaGUgPSBAX2dldHRlcl9jYWNoZSB8fD0ge31cbiAgICByZXR1cm4gY2FjaGVbbmFtZV0gaWYgbmFtZSBvZiBjYWNoZVxuICAgIGNhY2hlW25hbWVdID0gZm4uY2FsbCh0aGlzKVxuXG5oc3YycmdiID0gKHtoLCBzLCB2fSkgLT5cbiAgaCAvPSAzNjBcbiAgYyA9IHYgKiBzXG4gIHggPSBjICogKDEgLSBNYXRoLmFicygoaCAqIDYpICUgMiAtIDEpKVxuICBjb21wb25lbnRzID0gc3dpdGNoIE1hdGguZmxvb3IoaCAqIDYpICUgNlxuICAgIHdoZW4gMCB0aGVuIFtjLCB4LCAwXVxuICAgIHdoZW4gMSB0aGVuIFt4LCBjLCAwXVxuICAgIHdoZW4gMiB0aGVuIFswLCBjLCB4XVxuICAgIHdoZW4gMyB0aGVuIFswLCB4LCBjXVxuICAgIHdoZW4gNCB0aGVuIFt4LCAwLCBjXVxuICAgIHdoZW4gNSB0aGVuIFtjLCAwLCB4XVxuICBbciwgZywgYl0gPSAoY29tcG9uZW50ICsgdiAtIGMgZm9yIGNvbXBvbmVudCBpbiBjb21wb25lbnRzKVxuICB7ciwgZywgYn1cblxucmdiMmNzcyA9ICh7ciwgZywgYn0pIC0+XG4gIFtyLCBnLCBiXSA9IChNYXRoLmZsb29yKDI1NSAqIGMpIGZvciBjIGluIFtyLCBnLCBiXSlcbiAgXCJyZ2IoI3tyfSwgI3tnfSwgI3tifSlcIlxuXG5oc3YyY3NzID0gKGhzdikgLT4gcmdiMmNzcyBoc3YycmdiKGhzdilcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGhzdjJjc3NcbiAgaHN2MnJnYlxuICByZ2IyY3NzXG59XG4iLCJ2YXIgcHJvY2Vzcz1yZXF1aXJlKFwiX19icm93c2VyaWZ5X3Byb2Nlc3NcIik7aWYgKCFwcm9jZXNzLkV2ZW50RW1pdHRlcikgcHJvY2Vzcy5FdmVudEVtaXR0ZXIgPSBmdW5jdGlvbiAoKSB7fTtcblxudmFyIEV2ZW50RW1pdHRlciA9IGV4cG9ydHMuRXZlbnRFbWl0dGVyID0gcHJvY2Vzcy5FdmVudEVtaXR0ZXI7XG52YXIgaXNBcnJheSA9IHR5cGVvZiBBcnJheS5pc0FycmF5ID09PSAnZnVuY3Rpb24nXG4gICAgPyBBcnJheS5pc0FycmF5XG4gICAgOiBmdW5jdGlvbiAoeHMpIHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh4cykgPT09ICdbb2JqZWN0IEFycmF5XSdcbiAgICB9XG47XG5mdW5jdGlvbiBpbmRleE9mICh4cywgeCkge1xuICAgIGlmICh4cy5pbmRleE9mKSByZXR1cm4geHMuaW5kZXhPZih4KTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHhzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmICh4ID09PSB4c1tpXSkgcmV0dXJuIGk7XG4gICAgfVxuICAgIHJldHVybiAtMTtcbn1cblxuLy8gQnkgZGVmYXVsdCBFdmVudEVtaXR0ZXJzIHdpbGwgcHJpbnQgYSB3YXJuaW5nIGlmIG1vcmUgdGhhblxuLy8gMTAgbGlzdGVuZXJzIGFyZSBhZGRlZCB0byBpdC4gVGhpcyBpcyBhIHVzZWZ1bCBkZWZhdWx0IHdoaWNoXG4vLyBoZWxwcyBmaW5kaW5nIG1lbW9yeSBsZWFrcy5cbi8vXG4vLyBPYnZpb3VzbHkgbm90IGFsbCBFbWl0dGVycyBzaG91bGQgYmUgbGltaXRlZCB0byAxMC4gVGhpcyBmdW5jdGlvbiBhbGxvd3Ncbi8vIHRoYXQgdG8gYmUgaW5jcmVhc2VkLiBTZXQgdG8gemVybyBmb3IgdW5saW1pdGVkLlxudmFyIGRlZmF1bHRNYXhMaXN0ZW5lcnMgPSAxMDtcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuc2V0TWF4TGlzdGVuZXJzID0gZnVuY3Rpb24obikge1xuICBpZiAoIXRoaXMuX2V2ZW50cykgdGhpcy5fZXZlbnRzID0ge307XG4gIHRoaXMuX2V2ZW50cy5tYXhMaXN0ZW5lcnMgPSBuO1xufTtcblxuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbih0eXBlKSB7XG4gIC8vIElmIHRoZXJlIGlzIG5vICdlcnJvcicgZXZlbnQgbGlzdGVuZXIgdGhlbiB0aHJvdy5cbiAgaWYgKHR5cGUgPT09ICdlcnJvcicpIHtcbiAgICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzLmVycm9yIHx8XG4gICAgICAgIChpc0FycmF5KHRoaXMuX2V2ZW50cy5lcnJvcikgJiYgIXRoaXMuX2V2ZW50cy5lcnJvci5sZW5ndGgpKVxuICAgIHtcbiAgICAgIGlmIChhcmd1bWVudHNbMV0gaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICB0aHJvdyBhcmd1bWVudHNbMV07IC8vIFVuaGFuZGxlZCAnZXJyb3InIGV2ZW50XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmNhdWdodCwgdW5zcGVjaWZpZWQgJ2Vycm9yJyBldmVudC5cIik7XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpIHJldHVybiBmYWxzZTtcbiAgdmFyIGhhbmRsZXIgPSB0aGlzLl9ldmVudHNbdHlwZV07XG4gIGlmICghaGFuZGxlcikgcmV0dXJuIGZhbHNlO1xuXG4gIGlmICh0eXBlb2YgaGFuZGxlciA9PSAnZnVuY3Rpb24nKSB7XG4gICAgc3dpdGNoIChhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICAvLyBmYXN0IGNhc2VzXG4gICAgICBjYXNlIDE6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDI6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMzpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSwgYXJndW1lbnRzWzJdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICAvLyBzbG93ZXJcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICAgICAgaGFuZGxlci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG5cbiAgfSBlbHNlIGlmIChpc0FycmF5KGhhbmRsZXIpKSB7XG4gICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuXG4gICAgdmFyIGxpc3RlbmVycyA9IGhhbmRsZXIuc2xpY2UoKTtcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IGxpc3RlbmVycy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIGxpc3RlbmVyc1tpXS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG5cbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn07XG5cbi8vIEV2ZW50RW1pdHRlciBpcyBkZWZpbmVkIGluIHNyYy9ub2RlX2V2ZW50cy5jY1xuLy8gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0KCkgaXMgYWxzbyBkZWZpbmVkIHRoZXJlLlxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIGlmICgnZnVuY3Rpb24nICE9PSB0eXBlb2YgbGlzdGVuZXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2FkZExpc3RlbmVyIG9ubHkgdGFrZXMgaW5zdGFuY2VzIG9mIEZ1bmN0aW9uJyk7XG4gIH1cblxuICBpZiAoIXRoaXMuX2V2ZW50cykgdGhpcy5fZXZlbnRzID0ge307XG5cbiAgLy8gVG8gYXZvaWQgcmVjdXJzaW9uIGluIHRoZSBjYXNlIHRoYXQgdHlwZSA9PSBcIm5ld0xpc3RlbmVyc1wiISBCZWZvcmVcbiAgLy8gYWRkaW5nIGl0IHRvIHRoZSBsaXN0ZW5lcnMsIGZpcnN0IGVtaXQgXCJuZXdMaXN0ZW5lcnNcIi5cbiAgdGhpcy5lbWl0KCduZXdMaXN0ZW5lcicsIHR5cGUsIGxpc3RlbmVyKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50c1t0eXBlXSkge1xuICAgIC8vIE9wdGltaXplIHRoZSBjYXNlIG9mIG9uZSBsaXN0ZW5lci4gRG9uJ3QgbmVlZCB0aGUgZXh0cmEgYXJyYXkgb2JqZWN0LlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IGxpc3RlbmVyO1xuICB9IGVsc2UgaWYgKGlzQXJyYXkodGhpcy5fZXZlbnRzW3R5cGVdKSkge1xuXG4gICAgLy8gQ2hlY2sgZm9yIGxpc3RlbmVyIGxlYWtcbiAgICBpZiAoIXRoaXMuX2V2ZW50c1t0eXBlXS53YXJuZWQpIHtcbiAgICAgIHZhciBtO1xuICAgICAgaWYgKHRoaXMuX2V2ZW50cy5tYXhMaXN0ZW5lcnMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBtID0gdGhpcy5fZXZlbnRzLm1heExpc3RlbmVycztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG0gPSBkZWZhdWx0TWF4TGlzdGVuZXJzO1xuICAgICAgfVxuXG4gICAgICBpZiAobSAmJiBtID4gMCAmJiB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoID4gbSkge1xuICAgICAgICB0aGlzLl9ldmVudHNbdHlwZV0ud2FybmVkID0gdHJ1ZTtcbiAgICAgICAgY29uc29sZS5lcnJvcignKG5vZGUpIHdhcm5pbmc6IHBvc3NpYmxlIEV2ZW50RW1pdHRlciBtZW1vcnkgJyArXG4gICAgICAgICAgICAgICAgICAgICAgJ2xlYWsgZGV0ZWN0ZWQuICVkIGxpc3RlbmVycyBhZGRlZC4gJyArXG4gICAgICAgICAgICAgICAgICAgICAgJ1VzZSBlbWl0dGVyLnNldE1heExpc3RlbmVycygpIHRvIGluY3JlYXNlIGxpbWl0LicsXG4gICAgICAgICAgICAgICAgICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdLmxlbmd0aCk7XG4gICAgICAgIGNvbnNvbGUudHJhY2UoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBJZiB3ZSd2ZSBhbHJlYWR5IGdvdCBhbiBhcnJheSwganVzdCBhcHBlbmQuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdLnB1c2gobGlzdGVuZXIpO1xuICB9IGVsc2Uge1xuICAgIC8vIEFkZGluZyB0aGUgc2Vjb25kIGVsZW1lbnQsIG5lZWQgdG8gY2hhbmdlIHRvIGFycmF5LlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IFt0aGlzLl9ldmVudHNbdHlwZV0sIGxpc3RlbmVyXTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbiA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgc2VsZi5vbih0eXBlLCBmdW5jdGlvbiBnKCkge1xuICAgIHNlbGYucmVtb3ZlTGlzdGVuZXIodHlwZSwgZyk7XG4gICAgbGlzdGVuZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfSk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgaWYgKCdmdW5jdGlvbicgIT09IHR5cGVvZiBsaXN0ZW5lcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncmVtb3ZlTGlzdGVuZXIgb25seSB0YWtlcyBpbnN0YW5jZXMgb2YgRnVuY3Rpb24nKTtcbiAgfVxuXG4gIC8vIGRvZXMgbm90IHVzZSBsaXN0ZW5lcnMoKSwgc28gbm8gc2lkZSBlZmZlY3Qgb2YgY3JlYXRpbmcgX2V2ZW50c1t0eXBlXVxuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW3R5cGVdKSByZXR1cm4gdGhpcztcblxuICB2YXIgbGlzdCA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICBpZiAoaXNBcnJheShsaXN0KSkge1xuICAgIHZhciBpID0gaW5kZXhPZihsaXN0LCBsaXN0ZW5lcik7XG4gICAgaWYgKGkgPCAwKSByZXR1cm4gdGhpcztcbiAgICBsaXN0LnNwbGljZShpLCAxKTtcbiAgICBpZiAobGlzdC5sZW5ndGggPT0gMClcbiAgICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gIH0gZWxzZSBpZiAodGhpcy5fZXZlbnRzW3R5cGVdID09PSBsaXN0ZW5lcikge1xuICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gZG9lcyBub3QgdXNlIGxpc3RlbmVycygpLCBzbyBubyBzaWRlIGVmZmVjdCBvZiBjcmVhdGluZyBfZXZlbnRzW3R5cGVdXG4gIGlmICh0eXBlICYmIHRoaXMuX2V2ZW50cyAmJiB0aGlzLl9ldmVudHNbdHlwZV0pIHRoaXMuX2V2ZW50c1t0eXBlXSA9IG51bGw7XG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XG4gIGlmICghdGhpcy5fZXZlbnRzKSB0aGlzLl9ldmVudHMgPSB7fTtcbiAgaWYgKCF0aGlzLl9ldmVudHNbdHlwZV0pIHRoaXMuX2V2ZW50c1t0eXBlXSA9IFtdO1xuICBpZiAoIWlzQXJyYXkodGhpcy5fZXZlbnRzW3R5cGVdKSkge1xuICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IFt0aGlzLl9ldmVudHNbdHlwZV1dO1xuICB9XG4gIHJldHVybiB0aGlzLl9ldmVudHNbdHlwZV07XG59O1xuXG5FdmVudEVtaXR0ZXIubGlzdGVuZXJDb3VudCA9IGZ1bmN0aW9uKGVtaXR0ZXIsIHR5cGUpIHtcbiAgdmFyIHJldDtcbiAgaWYgKCFlbWl0dGVyLl9ldmVudHMgfHwgIWVtaXR0ZXIuX2V2ZW50c1t0eXBlXSlcbiAgICByZXQgPSAwO1xuICBlbHNlIGlmICh0eXBlb2YgZW1pdHRlci5fZXZlbnRzW3R5cGVdID09PSAnZnVuY3Rpb24nKVxuICAgIHJldCA9IDE7XG4gIGVsc2VcbiAgICByZXQgPSBlbWl0dGVyLl9ldmVudHNbdHlwZV0ubGVuZ3RoO1xuICByZXR1cm4gcmV0O1xufTtcbiIsIi8vIG5vdGhpbmcgdG8gc2VlIGhlcmUuLi4gbm8gZmlsZSBtZXRob2RzIGZvciB0aGUgYnJvd3NlclxuIiwidmFyIHByb2Nlc3M9cmVxdWlyZShcIl9fYnJvd3NlcmlmeV9wcm9jZXNzXCIpO2Z1bmN0aW9uIGZpbHRlciAoeHMsIGZuKSB7XG4gICAgdmFyIHJlcyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgeHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKGZuKHhzW2ldLCBpLCB4cykpIHJlcy5wdXNoKHhzW2ldKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbn1cblxuLy8gcmVzb2x2ZXMgLiBhbmQgLi4gZWxlbWVudHMgaW4gYSBwYXRoIGFycmF5IHdpdGggZGlyZWN0b3J5IG5hbWVzIHRoZXJlXG4vLyBtdXN0IGJlIG5vIHNsYXNoZXMsIGVtcHR5IGVsZW1lbnRzLCBvciBkZXZpY2UgbmFtZXMgKGM6XFwpIGluIHRoZSBhcnJheVxuLy8gKHNvIGFsc28gbm8gbGVhZGluZyBhbmQgdHJhaWxpbmcgc2xhc2hlcyAtIGl0IGRvZXMgbm90IGRpc3Rpbmd1aXNoXG4vLyByZWxhdGl2ZSBhbmQgYWJzb2x1dGUgcGF0aHMpXG5mdW5jdGlvbiBub3JtYWxpemVBcnJheShwYXJ0cywgYWxsb3dBYm92ZVJvb3QpIHtcbiAgLy8gaWYgdGhlIHBhdGggdHJpZXMgdG8gZ28gYWJvdmUgdGhlIHJvb3QsIGB1cGAgZW5kcyB1cCA+IDBcbiAgdmFyIHVwID0gMDtcbiAgZm9yICh2YXIgaSA9IHBhcnRzLmxlbmd0aDsgaSA+PSAwOyBpLS0pIHtcbiAgICB2YXIgbGFzdCA9IHBhcnRzW2ldO1xuICAgIGlmIChsYXN0ID09ICcuJykge1xuICAgICAgcGFydHMuc3BsaWNlKGksIDEpO1xuICAgIH0gZWxzZSBpZiAobGFzdCA9PT0gJy4uJykge1xuICAgICAgcGFydHMuc3BsaWNlKGksIDEpO1xuICAgICAgdXArKztcbiAgICB9IGVsc2UgaWYgKHVwKSB7XG4gICAgICBwYXJ0cy5zcGxpY2UoaSwgMSk7XG4gICAgICB1cC0tO1xuICAgIH1cbiAgfVxuXG4gIC8vIGlmIHRoZSBwYXRoIGlzIGFsbG93ZWQgdG8gZ28gYWJvdmUgdGhlIHJvb3QsIHJlc3RvcmUgbGVhZGluZyAuLnNcbiAgaWYgKGFsbG93QWJvdmVSb290KSB7XG4gICAgZm9yICg7IHVwLS07IHVwKSB7XG4gICAgICBwYXJ0cy51bnNoaWZ0KCcuLicpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBwYXJ0cztcbn1cblxuLy8gUmVnZXggdG8gc3BsaXQgYSBmaWxlbmFtZSBpbnRvIFsqLCBkaXIsIGJhc2VuYW1lLCBleHRdXG4vLyBwb3NpeCB2ZXJzaW9uXG52YXIgc3BsaXRQYXRoUmUgPSAvXiguK1xcLyg/ISQpfFxcLyk/KCg/Oi4rPyk/KFxcLlteLl0qKT8pJC87XG5cbi8vIHBhdGgucmVzb2x2ZShbZnJvbSAuLi5dLCB0bylcbi8vIHBvc2l4IHZlcnNpb25cbmV4cG9ydHMucmVzb2x2ZSA9IGZ1bmN0aW9uKCkge1xudmFyIHJlc29sdmVkUGF0aCA9ICcnLFxuICAgIHJlc29sdmVkQWJzb2x1dGUgPSBmYWxzZTtcblxuZm9yICh2YXIgaSA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPj0gLTEgJiYgIXJlc29sdmVkQWJzb2x1dGU7IGktLSkge1xuICB2YXIgcGF0aCA9IChpID49IDApXG4gICAgICA/IGFyZ3VtZW50c1tpXVxuICAgICAgOiBwcm9jZXNzLmN3ZCgpO1xuXG4gIC8vIFNraXAgZW1wdHkgYW5kIGludmFsaWQgZW50cmllc1xuICBpZiAodHlwZW9mIHBhdGggIT09ICdzdHJpbmcnIHx8ICFwYXRoKSB7XG4gICAgY29udGludWU7XG4gIH1cblxuICByZXNvbHZlZFBhdGggPSBwYXRoICsgJy8nICsgcmVzb2x2ZWRQYXRoO1xuICByZXNvbHZlZEFic29sdXRlID0gcGF0aC5jaGFyQXQoMCkgPT09ICcvJztcbn1cblxuLy8gQXQgdGhpcyBwb2ludCB0aGUgcGF0aCBzaG91bGQgYmUgcmVzb2x2ZWQgdG8gYSBmdWxsIGFic29sdXRlIHBhdGgsIGJ1dFxuLy8gaGFuZGxlIHJlbGF0aXZlIHBhdGhzIHRvIGJlIHNhZmUgKG1pZ2h0IGhhcHBlbiB3aGVuIHByb2Nlc3MuY3dkKCkgZmFpbHMpXG5cbi8vIE5vcm1hbGl6ZSB0aGUgcGF0aFxucmVzb2x2ZWRQYXRoID0gbm9ybWFsaXplQXJyYXkoZmlsdGVyKHJlc29sdmVkUGF0aC5zcGxpdCgnLycpLCBmdW5jdGlvbihwKSB7XG4gICAgcmV0dXJuICEhcDtcbiAgfSksICFyZXNvbHZlZEFic29sdXRlKS5qb2luKCcvJyk7XG5cbiAgcmV0dXJuICgocmVzb2x2ZWRBYnNvbHV0ZSA/ICcvJyA6ICcnKSArIHJlc29sdmVkUGF0aCkgfHwgJy4nO1xufTtcblxuLy8gcGF0aC5ub3JtYWxpemUocGF0aClcbi8vIHBvc2l4IHZlcnNpb25cbmV4cG9ydHMubm9ybWFsaXplID0gZnVuY3Rpb24ocGF0aCkge1xudmFyIGlzQWJzb2x1dGUgPSBwYXRoLmNoYXJBdCgwKSA9PT0gJy8nLFxuICAgIHRyYWlsaW5nU2xhc2ggPSBwYXRoLnNsaWNlKC0xKSA9PT0gJy8nO1xuXG4vLyBOb3JtYWxpemUgdGhlIHBhdGhcbnBhdGggPSBub3JtYWxpemVBcnJheShmaWx0ZXIocGF0aC5zcGxpdCgnLycpLCBmdW5jdGlvbihwKSB7XG4gICAgcmV0dXJuICEhcDtcbiAgfSksICFpc0Fic29sdXRlKS5qb2luKCcvJyk7XG5cbiAgaWYgKCFwYXRoICYmICFpc0Fic29sdXRlKSB7XG4gICAgcGF0aCA9ICcuJztcbiAgfVxuICBpZiAocGF0aCAmJiB0cmFpbGluZ1NsYXNoKSB7XG4gICAgcGF0aCArPSAnLyc7XG4gIH1cbiAgXG4gIHJldHVybiAoaXNBYnNvbHV0ZSA/ICcvJyA6ICcnKSArIHBhdGg7XG59O1xuXG5cbi8vIHBvc2l4IHZlcnNpb25cbmV4cG9ydHMuam9pbiA9IGZ1bmN0aW9uKCkge1xuICB2YXIgcGF0aHMgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDApO1xuICByZXR1cm4gZXhwb3J0cy5ub3JtYWxpemUoZmlsdGVyKHBhdGhzLCBmdW5jdGlvbihwLCBpbmRleCkge1xuICAgIHJldHVybiBwICYmIHR5cGVvZiBwID09PSAnc3RyaW5nJztcbiAgfSkuam9pbignLycpKTtcbn07XG5cblxuZXhwb3J0cy5kaXJuYW1lID0gZnVuY3Rpb24ocGF0aCkge1xuICB2YXIgZGlyID0gc3BsaXRQYXRoUmUuZXhlYyhwYXRoKVsxXSB8fCAnJztcbiAgdmFyIGlzV2luZG93cyA9IGZhbHNlO1xuICBpZiAoIWRpcikge1xuICAgIC8vIE5vIGRpcm5hbWVcbiAgICByZXR1cm4gJy4nO1xuICB9IGVsc2UgaWYgKGRpci5sZW5ndGggPT09IDEgfHxcbiAgICAgIChpc1dpbmRvd3MgJiYgZGlyLmxlbmd0aCA8PSAzICYmIGRpci5jaGFyQXQoMSkgPT09ICc6JykpIHtcbiAgICAvLyBJdCBpcyBqdXN0IGEgc2xhc2ggb3IgYSBkcml2ZSBsZXR0ZXIgd2l0aCBhIHNsYXNoXG4gICAgcmV0dXJuIGRpcjtcbiAgfSBlbHNlIHtcbiAgICAvLyBJdCBpcyBhIGZ1bGwgZGlybmFtZSwgc3RyaXAgdHJhaWxpbmcgc2xhc2hcbiAgICByZXR1cm4gZGlyLnN1YnN0cmluZygwLCBkaXIubGVuZ3RoIC0gMSk7XG4gIH1cbn07XG5cblxuZXhwb3J0cy5iYXNlbmFtZSA9IGZ1bmN0aW9uKHBhdGgsIGV4dCkge1xuICB2YXIgZiA9IHNwbGl0UGF0aFJlLmV4ZWMocGF0aClbMl0gfHwgJyc7XG4gIC8vIFRPRE86IG1ha2UgdGhpcyBjb21wYXJpc29uIGNhc2UtaW5zZW5zaXRpdmUgb24gd2luZG93cz9cbiAgaWYgKGV4dCAmJiBmLnN1YnN0cigtMSAqIGV4dC5sZW5ndGgpID09PSBleHQpIHtcbiAgICBmID0gZi5zdWJzdHIoMCwgZi5sZW5ndGggLSBleHQubGVuZ3RoKTtcbiAgfVxuICByZXR1cm4gZjtcbn07XG5cblxuZXhwb3J0cy5leHRuYW1lID0gZnVuY3Rpb24ocGF0aCkge1xuICByZXR1cm4gc3BsaXRQYXRoUmUuZXhlYyhwYXRoKVszXSB8fCAnJztcbn07XG5cbmV4cG9ydHMucmVsYXRpdmUgPSBmdW5jdGlvbihmcm9tLCB0bykge1xuICBmcm9tID0gZXhwb3J0cy5yZXNvbHZlKGZyb20pLnN1YnN0cigxKTtcbiAgdG8gPSBleHBvcnRzLnJlc29sdmUodG8pLnN1YnN0cigxKTtcblxuICBmdW5jdGlvbiB0cmltKGFycikge1xuICAgIHZhciBzdGFydCA9IDA7XG4gICAgZm9yICg7IHN0YXJ0IDwgYXJyLmxlbmd0aDsgc3RhcnQrKykge1xuICAgICAgaWYgKGFycltzdGFydF0gIT09ICcnKSBicmVhaztcbiAgICB9XG5cbiAgICB2YXIgZW5kID0gYXJyLmxlbmd0aCAtIDE7XG4gICAgZm9yICg7IGVuZCA+PSAwOyBlbmQtLSkge1xuICAgICAgaWYgKGFycltlbmRdICE9PSAnJykgYnJlYWs7XG4gICAgfVxuXG4gICAgaWYgKHN0YXJ0ID4gZW5kKSByZXR1cm4gW107XG4gICAgcmV0dXJuIGFyci5zbGljZShzdGFydCwgZW5kIC0gc3RhcnQgKyAxKTtcbiAgfVxuXG4gIHZhciBmcm9tUGFydHMgPSB0cmltKGZyb20uc3BsaXQoJy8nKSk7XG4gIHZhciB0b1BhcnRzID0gdHJpbSh0by5zcGxpdCgnLycpKTtcblxuICB2YXIgbGVuZ3RoID0gTWF0aC5taW4oZnJvbVBhcnRzLmxlbmd0aCwgdG9QYXJ0cy5sZW5ndGgpO1xuICB2YXIgc2FtZVBhcnRzTGVuZ3RoID0gbGVuZ3RoO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKGZyb21QYXJ0c1tpXSAhPT0gdG9QYXJ0c1tpXSkge1xuICAgICAgc2FtZVBhcnRzTGVuZ3RoID0gaTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHZhciBvdXRwdXRQYXJ0cyA9IFtdO1xuICBmb3IgKHZhciBpID0gc2FtZVBhcnRzTGVuZ3RoOyBpIDwgZnJvbVBhcnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgb3V0cHV0UGFydHMucHVzaCgnLi4nKTtcbiAgfVxuXG4gIG91dHB1dFBhcnRzID0gb3V0cHV0UGFydHMuY29uY2F0KHRvUGFydHMuc2xpY2Uoc2FtZVBhcnRzTGVuZ3RoKSk7XG5cbiAgcmV0dXJuIG91dHB1dFBhcnRzLmpvaW4oJy8nKTtcbn07XG5cbmV4cG9ydHMuc2VwID0gJy8nO1xuIiwidmFyIGV2ZW50cyA9IHJlcXVpcmUoJ2V2ZW50cycpO1xuXG5leHBvcnRzLmlzQXJyYXkgPSBpc0FycmF5O1xuZXhwb3J0cy5pc0RhdGUgPSBmdW5jdGlvbihvYmope3JldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgRGF0ZV0nfTtcbmV4cG9ydHMuaXNSZWdFeHAgPSBmdW5jdGlvbihvYmope3JldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgUmVnRXhwXSd9O1xuXG5cbmV4cG9ydHMucHJpbnQgPSBmdW5jdGlvbiAoKSB7fTtcbmV4cG9ydHMucHV0cyA9IGZ1bmN0aW9uICgpIHt9O1xuZXhwb3J0cy5kZWJ1ZyA9IGZ1bmN0aW9uKCkge307XG5cbmV4cG9ydHMuaW5zcGVjdCA9IGZ1bmN0aW9uKG9iaiwgc2hvd0hpZGRlbiwgZGVwdGgsIGNvbG9ycykge1xuICB2YXIgc2VlbiA9IFtdO1xuXG4gIHZhciBzdHlsaXplID0gZnVuY3Rpb24oc3RyLCBzdHlsZVR5cGUpIHtcbiAgICAvLyBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0FOU0lfZXNjYXBlX2NvZGUjZ3JhcGhpY3NcbiAgICB2YXIgc3R5bGVzID1cbiAgICAgICAgeyAnYm9sZCcgOiBbMSwgMjJdLFxuICAgICAgICAgICdpdGFsaWMnIDogWzMsIDIzXSxcbiAgICAgICAgICAndW5kZXJsaW5lJyA6IFs0LCAyNF0sXG4gICAgICAgICAgJ2ludmVyc2UnIDogWzcsIDI3XSxcbiAgICAgICAgICAnd2hpdGUnIDogWzM3LCAzOV0sXG4gICAgICAgICAgJ2dyZXknIDogWzkwLCAzOV0sXG4gICAgICAgICAgJ2JsYWNrJyA6IFszMCwgMzldLFxuICAgICAgICAgICdibHVlJyA6IFszNCwgMzldLFxuICAgICAgICAgICdjeWFuJyA6IFszNiwgMzldLFxuICAgICAgICAgICdncmVlbicgOiBbMzIsIDM5XSxcbiAgICAgICAgICAnbWFnZW50YScgOiBbMzUsIDM5XSxcbiAgICAgICAgICAncmVkJyA6IFszMSwgMzldLFxuICAgICAgICAgICd5ZWxsb3cnIDogWzMzLCAzOV0gfTtcblxuICAgIHZhciBzdHlsZSA9XG4gICAgICAgIHsgJ3NwZWNpYWwnOiAnY3lhbicsXG4gICAgICAgICAgJ251bWJlcic6ICdibHVlJyxcbiAgICAgICAgICAnYm9vbGVhbic6ICd5ZWxsb3cnLFxuICAgICAgICAgICd1bmRlZmluZWQnOiAnZ3JleScsXG4gICAgICAgICAgJ251bGwnOiAnYm9sZCcsXG4gICAgICAgICAgJ3N0cmluZyc6ICdncmVlbicsXG4gICAgICAgICAgJ2RhdGUnOiAnbWFnZW50YScsXG4gICAgICAgICAgLy8gXCJuYW1lXCI6IGludGVudGlvbmFsbHkgbm90IHN0eWxpbmdcbiAgICAgICAgICAncmVnZXhwJzogJ3JlZCcgfVtzdHlsZVR5cGVdO1xuXG4gICAgaWYgKHN0eWxlKSB7XG4gICAgICByZXR1cm4gJ1xcdTAwMWJbJyArIHN0eWxlc1tzdHlsZV1bMF0gKyAnbScgKyBzdHIgK1xuICAgICAgICAgICAgICdcXHUwMDFiWycgKyBzdHlsZXNbc3R5bGVdWzFdICsgJ20nO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gc3RyO1xuICAgIH1cbiAgfTtcbiAgaWYgKCEgY29sb3JzKSB7XG4gICAgc3R5bGl6ZSA9IGZ1bmN0aW9uKHN0ciwgc3R5bGVUeXBlKSB7IHJldHVybiBzdHI7IH07XG4gIH1cblxuICBmdW5jdGlvbiBmb3JtYXQodmFsdWUsIHJlY3Vyc2VUaW1lcykge1xuICAgIC8vIFByb3ZpZGUgYSBob29rIGZvciB1c2VyLXNwZWNpZmllZCBpbnNwZWN0IGZ1bmN0aW9ucy5cbiAgICAvLyBDaGVjayB0aGF0IHZhbHVlIGlzIGFuIG9iamVjdCB3aXRoIGFuIGluc3BlY3QgZnVuY3Rpb24gb24gaXRcbiAgICBpZiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlLmluc3BlY3QgPT09ICdmdW5jdGlvbicgJiZcbiAgICAgICAgLy8gRmlsdGVyIG91dCB0aGUgdXRpbCBtb2R1bGUsIGl0J3MgaW5zcGVjdCBmdW5jdGlvbiBpcyBzcGVjaWFsXG4gICAgICAgIHZhbHVlICE9PSBleHBvcnRzICYmXG4gICAgICAgIC8vIEFsc28gZmlsdGVyIG91dCBhbnkgcHJvdG90eXBlIG9iamVjdHMgdXNpbmcgdGhlIGNpcmN1bGFyIGNoZWNrLlxuICAgICAgICAhKHZhbHVlLmNvbnN0cnVjdG9yICYmIHZhbHVlLmNvbnN0cnVjdG9yLnByb3RvdHlwZSA9PT0gdmFsdWUpKSB7XG4gICAgICByZXR1cm4gdmFsdWUuaW5zcGVjdChyZWN1cnNlVGltZXMpO1xuICAgIH1cblxuICAgIC8vIFByaW1pdGl2ZSB0eXBlcyBjYW5ub3QgaGF2ZSBwcm9wZXJ0aWVzXG4gICAgc3dpdGNoICh0eXBlb2YgdmFsdWUpIHtcbiAgICAgIGNhc2UgJ3VuZGVmaW5lZCc6XG4gICAgICAgIHJldHVybiBzdHlsaXplKCd1bmRlZmluZWQnLCAndW5kZWZpbmVkJyk7XG5cbiAgICAgIGNhc2UgJ3N0cmluZyc6XG4gICAgICAgIHZhciBzaW1wbGUgPSAnXFwnJyArIEpTT04uc3RyaW5naWZ5KHZhbHVlKS5yZXBsYWNlKC9eXCJ8XCIkL2csICcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8nL2csIFwiXFxcXCdcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxcXFwiL2csICdcIicpICsgJ1xcJyc7XG4gICAgICAgIHJldHVybiBzdHlsaXplKHNpbXBsZSwgJ3N0cmluZycpO1xuXG4gICAgICBjYXNlICdudW1iZXInOlxuICAgICAgICByZXR1cm4gc3R5bGl6ZSgnJyArIHZhbHVlLCAnbnVtYmVyJyk7XG5cbiAgICAgIGNhc2UgJ2Jvb2xlYW4nOlxuICAgICAgICByZXR1cm4gc3R5bGl6ZSgnJyArIHZhbHVlLCAnYm9vbGVhbicpO1xuICAgIH1cbiAgICAvLyBGb3Igc29tZSByZWFzb24gdHlwZW9mIG51bGwgaXMgXCJvYmplY3RcIiwgc28gc3BlY2lhbCBjYXNlIGhlcmUuXG4gICAgaWYgKHZhbHVlID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gc3R5bGl6ZSgnbnVsbCcsICdudWxsJyk7XG4gICAgfVxuXG4gICAgLy8gTG9vayB1cCB0aGUga2V5cyBvZiB0aGUgb2JqZWN0LlxuICAgIHZhciB2aXNpYmxlX2tleXMgPSBPYmplY3Rfa2V5cyh2YWx1ZSk7XG4gICAgdmFyIGtleXMgPSBzaG93SGlkZGVuID8gT2JqZWN0X2dldE93blByb3BlcnR5TmFtZXModmFsdWUpIDogdmlzaWJsZV9rZXlzO1xuXG4gICAgLy8gRnVuY3Rpb25zIHdpdGhvdXQgcHJvcGVydGllcyBjYW4gYmUgc2hvcnRjdXR0ZWQuXG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJyAmJiBrZXlzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgICAgICByZXR1cm4gc3R5bGl6ZSgnJyArIHZhbHVlLCAncmVnZXhwJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgbmFtZSA9IHZhbHVlLm5hbWUgPyAnOiAnICsgdmFsdWUubmFtZSA6ICcnO1xuICAgICAgICByZXR1cm4gc3R5bGl6ZSgnW0Z1bmN0aW9uJyArIG5hbWUgKyAnXScsICdzcGVjaWFsJyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gRGF0ZXMgd2l0aG91dCBwcm9wZXJ0aWVzIGNhbiBiZSBzaG9ydGN1dHRlZFxuICAgIGlmIChpc0RhdGUodmFsdWUpICYmIGtleXMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gc3R5bGl6ZSh2YWx1ZS50b1VUQ1N0cmluZygpLCAnZGF0ZScpO1xuICAgIH1cblxuICAgIHZhciBiYXNlLCB0eXBlLCBicmFjZXM7XG4gICAgLy8gRGV0ZXJtaW5lIHRoZSBvYmplY3QgdHlwZVxuICAgIGlmIChpc0FycmF5KHZhbHVlKSkge1xuICAgICAgdHlwZSA9ICdBcnJheSc7XG4gICAgICBicmFjZXMgPSBbJ1snLCAnXSddO1xuICAgIH0gZWxzZSB7XG4gICAgICB0eXBlID0gJ09iamVjdCc7XG4gICAgICBicmFjZXMgPSBbJ3snLCAnfSddO1xuICAgIH1cblxuICAgIC8vIE1ha2UgZnVuY3Rpb25zIHNheSB0aGF0IHRoZXkgYXJlIGZ1bmN0aW9uc1xuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHZhciBuID0gdmFsdWUubmFtZSA/ICc6ICcgKyB2YWx1ZS5uYW1lIDogJyc7XG4gICAgICBiYXNlID0gKGlzUmVnRXhwKHZhbHVlKSkgPyAnICcgKyB2YWx1ZSA6ICcgW0Z1bmN0aW9uJyArIG4gKyAnXSc7XG4gICAgfSBlbHNlIHtcbiAgICAgIGJhc2UgPSAnJztcbiAgICB9XG5cbiAgICAvLyBNYWtlIGRhdGVzIHdpdGggcHJvcGVydGllcyBmaXJzdCBzYXkgdGhlIGRhdGVcbiAgICBpZiAoaXNEYXRlKHZhbHVlKSkge1xuICAgICAgYmFzZSA9ICcgJyArIHZhbHVlLnRvVVRDU3RyaW5nKCk7XG4gICAgfVxuXG4gICAgaWYgKGtleXMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gYnJhY2VzWzBdICsgYmFzZSArIGJyYWNlc1sxXTtcbiAgICB9XG5cbiAgICBpZiAocmVjdXJzZVRpbWVzIDwgMCkge1xuICAgICAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgICAgICByZXR1cm4gc3R5bGl6ZSgnJyArIHZhbHVlLCAncmVnZXhwJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gc3R5bGl6ZSgnW09iamVjdF0nLCAnc3BlY2lhbCcpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHNlZW4ucHVzaCh2YWx1ZSk7XG5cbiAgICB2YXIgb3V0cHV0ID0ga2V5cy5tYXAoZnVuY3Rpb24oa2V5KSB7XG4gICAgICB2YXIgbmFtZSwgc3RyO1xuICAgICAgaWYgKHZhbHVlLl9fbG9va3VwR2V0dGVyX18pIHtcbiAgICAgICAgaWYgKHZhbHVlLl9fbG9va3VwR2V0dGVyX18oa2V5KSkge1xuICAgICAgICAgIGlmICh2YWx1ZS5fX2xvb2t1cFNldHRlcl9fKGtleSkpIHtcbiAgICAgICAgICAgIHN0ciA9IHN0eWxpemUoJ1tHZXR0ZXIvU2V0dGVyXScsICdzcGVjaWFsJyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN0ciA9IHN0eWxpemUoJ1tHZXR0ZXJdJywgJ3NwZWNpYWwnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKHZhbHVlLl9fbG9va3VwU2V0dGVyX18oa2V5KSkge1xuICAgICAgICAgICAgc3RyID0gc3R5bGl6ZSgnW1NldHRlcl0nLCAnc3BlY2lhbCcpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHZpc2libGVfa2V5cy5pbmRleE9mKGtleSkgPCAwKSB7XG4gICAgICAgIG5hbWUgPSAnWycgKyBrZXkgKyAnXSc7XG4gICAgICB9XG4gICAgICBpZiAoIXN0cikge1xuICAgICAgICBpZiAoc2Vlbi5pbmRleE9mKHZhbHVlW2tleV0pIDwgMCkge1xuICAgICAgICAgIGlmIChyZWN1cnNlVGltZXMgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHN0ciA9IGZvcm1hdCh2YWx1ZVtrZXldKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3RyID0gZm9ybWF0KHZhbHVlW2tleV0sIHJlY3Vyc2VUaW1lcyAtIDEpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoc3RyLmluZGV4T2YoJ1xcbicpID4gLTEpIHtcbiAgICAgICAgICAgIGlmIChpc0FycmF5KHZhbHVlKSkge1xuICAgICAgICAgICAgICBzdHIgPSBzdHIuc3BsaXQoJ1xcbicpLm1hcChmdW5jdGlvbihsaW5lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICcgICcgKyBsaW5lO1xuICAgICAgICAgICAgICB9KS5qb2luKCdcXG4nKS5zdWJzdHIoMik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBzdHIgPSAnXFxuJyArIHN0ci5zcGxpdCgnXFxuJykubWFwKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJyAgICcgKyBsaW5lO1xuICAgICAgICAgICAgICB9KS5qb2luKCdcXG4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3RyID0gc3R5bGl6ZSgnW0NpcmN1bGFyXScsICdzcGVjaWFsJyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgbmFtZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgaWYgKHR5cGUgPT09ICdBcnJheScgJiYga2V5Lm1hdGNoKC9eXFxkKyQvKSkge1xuICAgICAgICAgIHJldHVybiBzdHI7XG4gICAgICAgIH1cbiAgICAgICAgbmFtZSA9IEpTT04uc3RyaW5naWZ5KCcnICsga2V5KTtcbiAgICAgICAgaWYgKG5hbWUubWF0Y2goL15cIihbYS16QS1aX11bYS16QS1aXzAtOV0qKVwiJC8pKSB7XG4gICAgICAgICAgbmFtZSA9IG5hbWUuc3Vic3RyKDEsIG5hbWUubGVuZ3RoIC0gMik7XG4gICAgICAgICAgbmFtZSA9IHN0eWxpemUobmFtZSwgJ25hbWUnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBuYW1lID0gbmFtZS5yZXBsYWNlKC8nL2csIFwiXFxcXCdcIilcbiAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXFxcXCIvZywgJ1wiJylcbiAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8oXlwifFwiJCkvZywgXCInXCIpO1xuICAgICAgICAgIG5hbWUgPSBzdHlsaXplKG5hbWUsICdzdHJpbmcnKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gbmFtZSArICc6ICcgKyBzdHI7XG4gICAgfSk7XG5cbiAgICBzZWVuLnBvcCgpO1xuXG4gICAgdmFyIG51bUxpbmVzRXN0ID0gMDtcbiAgICB2YXIgbGVuZ3RoID0gb3V0cHV0LnJlZHVjZShmdW5jdGlvbihwcmV2LCBjdXIpIHtcbiAgICAgIG51bUxpbmVzRXN0Kys7XG4gICAgICBpZiAoY3VyLmluZGV4T2YoJ1xcbicpID49IDApIG51bUxpbmVzRXN0Kys7XG4gICAgICByZXR1cm4gcHJldiArIGN1ci5sZW5ndGggKyAxO1xuICAgIH0sIDApO1xuXG4gICAgaWYgKGxlbmd0aCA+IDUwKSB7XG4gICAgICBvdXRwdXQgPSBicmFjZXNbMF0gK1xuICAgICAgICAgICAgICAgKGJhc2UgPT09ICcnID8gJycgOiBiYXNlICsgJ1xcbiAnKSArXG4gICAgICAgICAgICAgICAnICcgK1xuICAgICAgICAgICAgICAgb3V0cHV0LmpvaW4oJyxcXG4gICcpICtcbiAgICAgICAgICAgICAgICcgJyArXG4gICAgICAgICAgICAgICBicmFjZXNbMV07XG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0cHV0ID0gYnJhY2VzWzBdICsgYmFzZSArICcgJyArIG91dHB1dC5qb2luKCcsICcpICsgJyAnICsgYnJhY2VzWzFdO1xuICAgIH1cblxuICAgIHJldHVybiBvdXRwdXQ7XG4gIH1cbiAgcmV0dXJuIGZvcm1hdChvYmosICh0eXBlb2YgZGVwdGggPT09ICd1bmRlZmluZWQnID8gMiA6IGRlcHRoKSk7XG59O1xuXG5cbmZ1bmN0aW9uIGlzQXJyYXkoYXIpIHtcbiAgcmV0dXJuIEFycmF5LmlzQXJyYXkoYXIpIHx8XG4gICAgICAgICAodHlwZW9mIGFyID09PSAnb2JqZWN0JyAmJiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoYXIpID09PSAnW29iamVjdCBBcnJheV0nKTtcbn1cblxuXG5mdW5jdGlvbiBpc1JlZ0V4cChyZSkge1xuICB0eXBlb2YgcmUgPT09ICdvYmplY3QnICYmIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChyZSkgPT09ICdbb2JqZWN0IFJlZ0V4cF0nO1xufVxuXG5cbmZ1bmN0aW9uIGlzRGF0ZShkKSB7XG4gIHJldHVybiB0eXBlb2YgZCA9PT0gJ29iamVjdCcgJiYgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGQpID09PSAnW29iamVjdCBEYXRlXSc7XG59XG5cbmZ1bmN0aW9uIHBhZChuKSB7XG4gIHJldHVybiBuIDwgMTAgPyAnMCcgKyBuLnRvU3RyaW5nKDEwKSA6IG4udG9TdHJpbmcoMTApO1xufVxuXG52YXIgbW9udGhzID0gWydKYW4nLCAnRmViJywgJ01hcicsICdBcHInLCAnTWF5JywgJ0p1bicsICdKdWwnLCAnQXVnJywgJ1NlcCcsXG4gICAgICAgICAgICAgICdPY3QnLCAnTm92JywgJ0RlYyddO1xuXG4vLyAyNiBGZWIgMTY6MTk6MzRcbmZ1bmN0aW9uIHRpbWVzdGFtcCgpIHtcbiAgdmFyIGQgPSBuZXcgRGF0ZSgpO1xuICB2YXIgdGltZSA9IFtwYWQoZC5nZXRIb3VycygpKSxcbiAgICAgICAgICAgICAgcGFkKGQuZ2V0TWludXRlcygpKSxcbiAgICAgICAgICAgICAgcGFkKGQuZ2V0U2Vjb25kcygpKV0uam9pbignOicpO1xuICByZXR1cm4gW2QuZ2V0RGF0ZSgpLCBtb250aHNbZC5nZXRNb250aCgpXSwgdGltZV0uam9pbignICcpO1xufVxuXG5leHBvcnRzLmxvZyA9IGZ1bmN0aW9uIChtc2cpIHt9O1xuXG5leHBvcnRzLnB1bXAgPSBudWxsO1xuXG52YXIgT2JqZWN0X2tleXMgPSBPYmplY3Qua2V5cyB8fCBmdW5jdGlvbiAob2JqKSB7XG4gICAgdmFyIHJlcyA9IFtdO1xuICAgIGZvciAodmFyIGtleSBpbiBvYmopIHJlcy5wdXNoKGtleSk7XG4gICAgcmV0dXJuIHJlcztcbn07XG5cbnZhciBPYmplY3RfZ2V0T3duUHJvcGVydHlOYW1lcyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzIHx8IGZ1bmN0aW9uIChvYmopIHtcbiAgICB2YXIgcmVzID0gW107XG4gICAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgICAgICBpZiAoT2JqZWN0Lmhhc093blByb3BlcnR5LmNhbGwob2JqLCBrZXkpKSByZXMucHVzaChrZXkpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzO1xufTtcblxudmFyIE9iamVjdF9jcmVhdGUgPSBPYmplY3QuY3JlYXRlIHx8IGZ1bmN0aW9uIChwcm90b3R5cGUsIHByb3BlcnRpZXMpIHtcbiAgICAvLyBmcm9tIGVzNS1zaGltXG4gICAgdmFyIG9iamVjdDtcbiAgICBpZiAocHJvdG90eXBlID09PSBudWxsKSB7XG4gICAgICAgIG9iamVjdCA9IHsgJ19fcHJvdG9fXycgOiBudWxsIH07XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBpZiAodHlwZW9mIHByb3RvdHlwZSAhPT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgICAgICAgICAgICAgJ3R5cGVvZiBwcm90b3R5cGVbJyArICh0eXBlb2YgcHJvdG90eXBlKSArICddICE9IFxcJ29iamVjdFxcJydcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIFR5cGUgPSBmdW5jdGlvbiAoKSB7fTtcbiAgICAgICAgVHlwZS5wcm90b3R5cGUgPSBwcm90b3R5cGU7XG4gICAgICAgIG9iamVjdCA9IG5ldyBUeXBlKCk7XG4gICAgICAgIG9iamVjdC5fX3Byb3RvX18gPSBwcm90b3R5cGU7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgcHJvcGVydGllcyAhPT0gJ3VuZGVmaW5lZCcgJiYgT2JqZWN0LmRlZmluZVByb3BlcnRpZXMpIHtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXMob2JqZWN0LCBwcm9wZXJ0aWVzKTtcbiAgICB9XG4gICAgcmV0dXJuIG9iamVjdDtcbn07XG5cbmV4cG9ydHMuaW5oZXJpdHMgPSBmdW5jdGlvbihjdG9yLCBzdXBlckN0b3IpIHtcbiAgY3Rvci5zdXBlcl8gPSBzdXBlckN0b3I7XG4gIGN0b3IucHJvdG90eXBlID0gT2JqZWN0X2NyZWF0ZShzdXBlckN0b3IucHJvdG90eXBlLCB7XG4gICAgY29uc3RydWN0b3I6IHtcbiAgICAgIHZhbHVlOiBjdG9yLFxuICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH1cbiAgfSk7XG59O1xuXG52YXIgZm9ybWF0UmVnRXhwID0gLyVbc2RqJV0vZztcbmV4cG9ydHMuZm9ybWF0ID0gZnVuY3Rpb24oZikge1xuICBpZiAodHlwZW9mIGYgIT09ICdzdHJpbmcnKSB7XG4gICAgdmFyIG9iamVjdHMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgb2JqZWN0cy5wdXNoKGV4cG9ydHMuaW5zcGVjdChhcmd1bWVudHNbaV0pKTtcbiAgICB9XG4gICAgcmV0dXJuIG9iamVjdHMuam9pbignICcpO1xuICB9XG5cbiAgdmFyIGkgPSAxO1xuICB2YXIgYXJncyA9IGFyZ3VtZW50cztcbiAgdmFyIGxlbiA9IGFyZ3MubGVuZ3RoO1xuICB2YXIgc3RyID0gU3RyaW5nKGYpLnJlcGxhY2UoZm9ybWF0UmVnRXhwLCBmdW5jdGlvbih4KSB7XG4gICAgaWYgKHggPT09ICclJScpIHJldHVybiAnJSc7XG4gICAgaWYgKGkgPj0gbGVuKSByZXR1cm4geDtcbiAgICBzd2l0Y2ggKHgpIHtcbiAgICAgIGNhc2UgJyVzJzogcmV0dXJuIFN0cmluZyhhcmdzW2krK10pO1xuICAgICAgY2FzZSAnJWQnOiByZXR1cm4gTnVtYmVyKGFyZ3NbaSsrXSk7XG4gICAgICBjYXNlICclaic6IHJldHVybiBKU09OLnN0cmluZ2lmeShhcmdzW2krK10pO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIHg7XG4gICAgfVxuICB9KTtcbiAgZm9yKHZhciB4ID0gYXJnc1tpXTsgaSA8IGxlbjsgeCA9IGFyZ3NbKytpXSl7XG4gICAgaWYgKHggPT09IG51bGwgfHwgdHlwZW9mIHggIT09ICdvYmplY3QnKSB7XG4gICAgICBzdHIgKz0gJyAnICsgeDtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RyICs9ICcgJyArIGV4cG9ydHMuaW5zcGVjdCh4KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHN0cjtcbn07XG4iLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcblxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG5wcm9jZXNzLm5leHRUaWNrID0gKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY2FuU2V0SW1tZWRpYXRlID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAmJiB3aW5kb3cuc2V0SW1tZWRpYXRlO1xuICAgIHZhciBjYW5Qb3N0ID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAmJiB3aW5kb3cucG9zdE1lc3NhZ2UgJiYgd2luZG93LmFkZEV2ZW50TGlzdGVuZXJcbiAgICA7XG5cbiAgICBpZiAoY2FuU2V0SW1tZWRpYXRlKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoZikgeyByZXR1cm4gd2luZG93LnNldEltbWVkaWF0ZShmKSB9O1xuICAgIH1cblxuICAgIGlmIChjYW5Qb3N0KSB7XG4gICAgICAgIHZhciBxdWV1ZSA9IFtdO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGZ1bmN0aW9uIChldikge1xuICAgICAgICAgICAgaWYgKGV2LnNvdXJjZSA9PT0gd2luZG93ICYmIGV2LmRhdGEgPT09ICdwcm9jZXNzLXRpY2snKSB7XG4gICAgICAgICAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgaWYgKHF1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZuID0gcXVldWUuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICAgICAgZm4oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHRydWUpO1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICAgICAgcXVldWUucHVzaChmbik7XG4gICAgICAgICAgICB3aW5kb3cucG9zdE1lc3NhZ2UoJ3Byb2Nlc3MtdGljaycsICcqJyk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZm4sIDApO1xuICAgIH07XG59KSgpO1xuXG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59XG5cbi8vIFRPRE8oc2h0eWxtYW4pXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbiIsIi8vICAgICBVbmRlcnNjb3JlLmpzIDEuNC40XG4vLyAgICAgaHR0cDovL3VuZGVyc2NvcmVqcy5vcmdcbi8vICAgICAoYykgMjAwOS0yMDEzIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBJbmMuXG4vLyAgICAgVW5kZXJzY29yZSBtYXkgYmUgZnJlZWx5IGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBNSVQgbGljZW5zZS5cblxuKGZ1bmN0aW9uKCkge1xuXG4gIC8vIEJhc2VsaW5lIHNldHVwXG4gIC8vIC0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gRXN0YWJsaXNoIHRoZSByb290IG9iamVjdCwgYHdpbmRvd2AgaW4gdGhlIGJyb3dzZXIsIG9yIGBnbG9iYWxgIG9uIHRoZSBzZXJ2ZXIuXG4gIHZhciByb290ID0gdGhpcztcblxuICAvLyBTYXZlIHRoZSBwcmV2aW91cyB2YWx1ZSBvZiB0aGUgYF9gIHZhcmlhYmxlLlxuICB2YXIgcHJldmlvdXNVbmRlcnNjb3JlID0gcm9vdC5fO1xuXG4gIC8vIEVzdGFibGlzaCB0aGUgb2JqZWN0IHRoYXQgZ2V0cyByZXR1cm5lZCB0byBicmVhayBvdXQgb2YgYSBsb29wIGl0ZXJhdGlvbi5cbiAgdmFyIGJyZWFrZXIgPSB7fTtcblxuICAvLyBTYXZlIGJ5dGVzIGluIHRoZSBtaW5pZmllZCAoYnV0IG5vdCBnemlwcGVkKSB2ZXJzaW9uOlxuICB2YXIgQXJyYXlQcm90byA9IEFycmF5LnByb3RvdHlwZSwgT2JqUHJvdG8gPSBPYmplY3QucHJvdG90eXBlLCBGdW5jUHJvdG8gPSBGdW5jdGlvbi5wcm90b3R5cGU7XG5cbiAgLy8gQ3JlYXRlIHF1aWNrIHJlZmVyZW5jZSB2YXJpYWJsZXMgZm9yIHNwZWVkIGFjY2VzcyB0byBjb3JlIHByb3RvdHlwZXMuXG4gIHZhciBwdXNoICAgICAgICAgICAgID0gQXJyYXlQcm90by5wdXNoLFxuICAgICAgc2xpY2UgICAgICAgICAgICA9IEFycmF5UHJvdG8uc2xpY2UsXG4gICAgICBjb25jYXQgICAgICAgICAgID0gQXJyYXlQcm90by5jb25jYXQsXG4gICAgICB0b1N0cmluZyAgICAgICAgID0gT2JqUHJvdG8udG9TdHJpbmcsXG4gICAgICBoYXNPd25Qcm9wZXJ0eSAgID0gT2JqUHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbiAgLy8gQWxsICoqRUNNQVNjcmlwdCA1KiogbmF0aXZlIGZ1bmN0aW9uIGltcGxlbWVudGF0aW9ucyB0aGF0IHdlIGhvcGUgdG8gdXNlXG4gIC8vIGFyZSBkZWNsYXJlZCBoZXJlLlxuICB2YXJcbiAgICBuYXRpdmVGb3JFYWNoICAgICAgPSBBcnJheVByb3RvLmZvckVhY2gsXG4gICAgbmF0aXZlTWFwICAgICAgICAgID0gQXJyYXlQcm90by5tYXAsXG4gICAgbmF0aXZlUmVkdWNlICAgICAgID0gQXJyYXlQcm90by5yZWR1Y2UsXG4gICAgbmF0aXZlUmVkdWNlUmlnaHQgID0gQXJyYXlQcm90by5yZWR1Y2VSaWdodCxcbiAgICBuYXRpdmVGaWx0ZXIgICAgICAgPSBBcnJheVByb3RvLmZpbHRlcixcbiAgICBuYXRpdmVFdmVyeSAgICAgICAgPSBBcnJheVByb3RvLmV2ZXJ5LFxuICAgIG5hdGl2ZVNvbWUgICAgICAgICA9IEFycmF5UHJvdG8uc29tZSxcbiAgICBuYXRpdmVJbmRleE9mICAgICAgPSBBcnJheVByb3RvLmluZGV4T2YsXG4gICAgbmF0aXZlTGFzdEluZGV4T2YgID0gQXJyYXlQcm90by5sYXN0SW5kZXhPZixcbiAgICBuYXRpdmVJc0FycmF5ICAgICAgPSBBcnJheS5pc0FycmF5LFxuICAgIG5hdGl2ZUtleXMgICAgICAgICA9IE9iamVjdC5rZXlzLFxuICAgIG5hdGl2ZUJpbmQgICAgICAgICA9IEZ1bmNQcm90by5iaW5kO1xuXG4gIC8vIENyZWF0ZSBhIHNhZmUgcmVmZXJlbmNlIHRvIHRoZSBVbmRlcnNjb3JlIG9iamVjdCBmb3IgdXNlIGJlbG93LlxuICB2YXIgXyA9IGZ1bmN0aW9uKG9iaikge1xuICAgIGlmIChvYmogaW5zdGFuY2VvZiBfKSByZXR1cm4gb2JqO1xuICAgIGlmICghKHRoaXMgaW5zdGFuY2VvZiBfKSkgcmV0dXJuIG5ldyBfKG9iaik7XG4gICAgdGhpcy5fd3JhcHBlZCA9IG9iajtcbiAgfTtcblxuICAvLyBFeHBvcnQgdGhlIFVuZGVyc2NvcmUgb2JqZWN0IGZvciAqKk5vZGUuanMqKiwgd2l0aFxuICAvLyBiYWNrd2FyZHMtY29tcGF0aWJpbGl0eSBmb3IgdGhlIG9sZCBgcmVxdWlyZSgpYCBBUEkuIElmIHdlJ3JlIGluXG4gIC8vIHRoZSBicm93c2VyLCBhZGQgYF9gIGFzIGEgZ2xvYmFsIG9iamVjdCB2aWEgYSBzdHJpbmcgaWRlbnRpZmllcixcbiAgLy8gZm9yIENsb3N1cmUgQ29tcGlsZXIgXCJhZHZhbmNlZFwiIG1vZGUuXG4gIGlmICh0eXBlb2YgZXhwb3J0cyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgICAgIGV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IF87XG4gICAgfVxuICAgIGV4cG9ydHMuXyA9IF87XG4gIH0gZWxzZSB7XG4gICAgcm9vdC5fID0gXztcbiAgfVxuXG4gIC8vIEN1cnJlbnQgdmVyc2lvbi5cbiAgXy5WRVJTSU9OID0gJzEuNC40JztcblxuICAvLyBDb2xsZWN0aW9uIEZ1bmN0aW9uc1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIFRoZSBjb3JuZXJzdG9uZSwgYW4gYGVhY2hgIGltcGxlbWVudGF0aW9uLCBha2EgYGZvckVhY2hgLlxuICAvLyBIYW5kbGVzIG9iamVjdHMgd2l0aCB0aGUgYnVpbHQtaW4gYGZvckVhY2hgLCBhcnJheXMsIGFuZCByYXcgb2JqZWN0cy5cbiAgLy8gRGVsZWdhdGVzIHRvICoqRUNNQVNjcmlwdCA1KioncyBuYXRpdmUgYGZvckVhY2hgIGlmIGF2YWlsYWJsZS5cbiAgdmFyIGVhY2ggPSBfLmVhY2ggPSBfLmZvckVhY2ggPSBmdW5jdGlvbihvYmosIGl0ZXJhdG9yLCBjb250ZXh0KSB7XG4gICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm47XG4gICAgaWYgKG5hdGl2ZUZvckVhY2ggJiYgb2JqLmZvckVhY2ggPT09IG5hdGl2ZUZvckVhY2gpIHtcbiAgICAgIG9iai5mb3JFYWNoKGl0ZXJhdG9yLCBjb250ZXh0KTtcbiAgICB9IGVsc2UgaWYgKG9iai5sZW5ndGggPT09ICtvYmoubGVuZ3RoKSB7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbCA9IG9iai5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgaWYgKGl0ZXJhdG9yLmNhbGwoY29udGV4dCwgb2JqW2ldLCBpLCBvYmopID09PSBicmVha2VyKSByZXR1cm47XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICAgICAgaWYgKF8uaGFzKG9iaiwga2V5KSkge1xuICAgICAgICAgIGlmIChpdGVyYXRvci5jYWxsKGNvbnRleHQsIG9ialtrZXldLCBrZXksIG9iaikgPT09IGJyZWFrZXIpIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICAvLyBSZXR1cm4gdGhlIHJlc3VsdHMgb2YgYXBwbHlpbmcgdGhlIGl0ZXJhdG9yIHRvIGVhY2ggZWxlbWVudC5cbiAgLy8gRGVsZWdhdGVzIHRvICoqRUNNQVNjcmlwdCA1KioncyBuYXRpdmUgYG1hcGAgaWYgYXZhaWxhYmxlLlxuICBfLm1hcCA9IF8uY29sbGVjdCA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0b3IsIGNvbnRleHQpIHtcbiAgICB2YXIgcmVzdWx0cyA9IFtdO1xuICAgIGlmIChvYmogPT0gbnVsbCkgcmV0dXJuIHJlc3VsdHM7XG4gICAgaWYgKG5hdGl2ZU1hcCAmJiBvYmoubWFwID09PSBuYXRpdmVNYXApIHJldHVybiBvYmoubWFwKGl0ZXJhdG9yLCBjb250ZXh0KTtcbiAgICBlYWNoKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBsaXN0KSB7XG4gICAgICByZXN1bHRzW3Jlc3VsdHMubGVuZ3RoXSA9IGl0ZXJhdG9yLmNhbGwoY29udGV4dCwgdmFsdWUsIGluZGV4LCBsaXN0KTtcbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfTtcblxuICB2YXIgcmVkdWNlRXJyb3IgPSAnUmVkdWNlIG9mIGVtcHR5IGFycmF5IHdpdGggbm8gaW5pdGlhbCB2YWx1ZSc7XG5cbiAgLy8gKipSZWR1Y2UqKiBidWlsZHMgdXAgYSBzaW5nbGUgcmVzdWx0IGZyb20gYSBsaXN0IG9mIHZhbHVlcywgYWthIGBpbmplY3RgLFxuICAvLyBvciBgZm9sZGxgLiBEZWxlZ2F0ZXMgdG8gKipFQ01BU2NyaXB0IDUqKidzIG5hdGl2ZSBgcmVkdWNlYCBpZiBhdmFpbGFibGUuXG4gIF8ucmVkdWNlID0gXy5mb2xkbCA9IF8uaW5qZWN0ID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRvciwgbWVtbywgY29udGV4dCkge1xuICAgIHZhciBpbml0aWFsID0gYXJndW1lbnRzLmxlbmd0aCA+IDI7XG4gICAgaWYgKG9iaiA9PSBudWxsKSBvYmogPSBbXTtcbiAgICBpZiAobmF0aXZlUmVkdWNlICYmIG9iai5yZWR1Y2UgPT09IG5hdGl2ZVJlZHVjZSkge1xuICAgICAgaWYgKGNvbnRleHQpIGl0ZXJhdG9yID0gXy5iaW5kKGl0ZXJhdG9yLCBjb250ZXh0KTtcbiAgICAgIHJldHVybiBpbml0aWFsID8gb2JqLnJlZHVjZShpdGVyYXRvciwgbWVtbykgOiBvYmoucmVkdWNlKGl0ZXJhdG9yKTtcbiAgICB9XG4gICAgZWFjaChvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgbGlzdCkge1xuICAgICAgaWYgKCFpbml0aWFsKSB7XG4gICAgICAgIG1lbW8gPSB2YWx1ZTtcbiAgICAgICAgaW5pdGlhbCA9IHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBtZW1vID0gaXRlcmF0b3IuY2FsbChjb250ZXh0LCBtZW1vLCB2YWx1ZSwgaW5kZXgsIGxpc3QpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGlmICghaW5pdGlhbCkgdGhyb3cgbmV3IFR5cGVFcnJvcihyZWR1Y2VFcnJvcik7XG4gICAgcmV0dXJuIG1lbW87XG4gIH07XG5cbiAgLy8gVGhlIHJpZ2h0LWFzc29jaWF0aXZlIHZlcnNpb24gb2YgcmVkdWNlLCBhbHNvIGtub3duIGFzIGBmb2xkcmAuXG4gIC8vIERlbGVnYXRlcyB0byAqKkVDTUFTY3JpcHQgNSoqJ3MgbmF0aXZlIGByZWR1Y2VSaWdodGAgaWYgYXZhaWxhYmxlLlxuICBfLnJlZHVjZVJpZ2h0ID0gXy5mb2xkciA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0b3IsIG1lbW8sIGNvbnRleHQpIHtcbiAgICB2YXIgaW5pdGlhbCA9IGFyZ3VtZW50cy5sZW5ndGggPiAyO1xuICAgIGlmIChvYmogPT0gbnVsbCkgb2JqID0gW107XG4gICAgaWYgKG5hdGl2ZVJlZHVjZVJpZ2h0ICYmIG9iai5yZWR1Y2VSaWdodCA9PT0gbmF0aXZlUmVkdWNlUmlnaHQpIHtcbiAgICAgIGlmIChjb250ZXh0KSBpdGVyYXRvciA9IF8uYmluZChpdGVyYXRvciwgY29udGV4dCk7XG4gICAgICByZXR1cm4gaW5pdGlhbCA/IG9iai5yZWR1Y2VSaWdodChpdGVyYXRvciwgbWVtbykgOiBvYmoucmVkdWNlUmlnaHQoaXRlcmF0b3IpO1xuICAgIH1cbiAgICB2YXIgbGVuZ3RoID0gb2JqLmxlbmd0aDtcbiAgICBpZiAobGVuZ3RoICE9PSArbGVuZ3RoKSB7XG4gICAgICB2YXIga2V5cyA9IF8ua2V5cyhvYmopO1xuICAgICAgbGVuZ3RoID0ga2V5cy5sZW5ndGg7XG4gICAgfVxuICAgIGVhY2gob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGxpc3QpIHtcbiAgICAgIGluZGV4ID0ga2V5cyA/IGtleXNbLS1sZW5ndGhdIDogLS1sZW5ndGg7XG4gICAgICBpZiAoIWluaXRpYWwpIHtcbiAgICAgICAgbWVtbyA9IG9ialtpbmRleF07XG4gICAgICAgIGluaXRpYWwgPSB0cnVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbWVtbyA9IGl0ZXJhdG9yLmNhbGwoY29udGV4dCwgbWVtbywgb2JqW2luZGV4XSwgaW5kZXgsIGxpc3QpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGlmICghaW5pdGlhbCkgdGhyb3cgbmV3IFR5cGVFcnJvcihyZWR1Y2VFcnJvcik7XG4gICAgcmV0dXJuIG1lbW87XG4gIH07XG5cbiAgLy8gUmV0dXJuIHRoZSBmaXJzdCB2YWx1ZSB3aGljaCBwYXNzZXMgYSB0cnV0aCB0ZXN0LiBBbGlhc2VkIGFzIGBkZXRlY3RgLlxuICBfLmZpbmQgPSBfLmRldGVjdCA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0b3IsIGNvbnRleHQpIHtcbiAgICB2YXIgcmVzdWx0O1xuICAgIGFueShvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgbGlzdCkge1xuICAgICAgaWYgKGl0ZXJhdG9yLmNhbGwoY29udGV4dCwgdmFsdWUsIGluZGV4LCBsaXN0KSkge1xuICAgICAgICByZXN1bHQgPSB2YWx1ZTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBSZXR1cm4gYWxsIHRoZSBlbGVtZW50cyB0aGF0IHBhc3MgYSB0cnV0aCB0ZXN0LlxuICAvLyBEZWxlZ2F0ZXMgdG8gKipFQ01BU2NyaXB0IDUqKidzIG5hdGl2ZSBgZmlsdGVyYCBpZiBhdmFpbGFibGUuXG4gIC8vIEFsaWFzZWQgYXMgYHNlbGVjdGAuXG4gIF8uZmlsdGVyID0gXy5zZWxlY3QgPSBmdW5jdGlvbihvYmosIGl0ZXJhdG9yLCBjb250ZXh0KSB7XG4gICAgdmFyIHJlc3VsdHMgPSBbXTtcbiAgICBpZiAob2JqID09IG51bGwpIHJldHVybiByZXN1bHRzO1xuICAgIGlmIChuYXRpdmVGaWx0ZXIgJiYgb2JqLmZpbHRlciA9PT0gbmF0aXZlRmlsdGVyKSByZXR1cm4gb2JqLmZpbHRlcihpdGVyYXRvciwgY29udGV4dCk7XG4gICAgZWFjaChvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgbGlzdCkge1xuICAgICAgaWYgKGl0ZXJhdG9yLmNhbGwoY29udGV4dCwgdmFsdWUsIGluZGV4LCBsaXN0KSkgcmVzdWx0c1tyZXN1bHRzLmxlbmd0aF0gPSB2YWx1ZTtcbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfTtcblxuICAvLyBSZXR1cm4gYWxsIHRoZSBlbGVtZW50cyBmb3Igd2hpY2ggYSB0cnV0aCB0ZXN0IGZhaWxzLlxuICBfLnJlamVjdCA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0b3IsIGNvbnRleHQpIHtcbiAgICByZXR1cm4gXy5maWx0ZXIob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGxpc3QpIHtcbiAgICAgIHJldHVybiAhaXRlcmF0b3IuY2FsbChjb250ZXh0LCB2YWx1ZSwgaW5kZXgsIGxpc3QpO1xuICAgIH0sIGNvbnRleHQpO1xuICB9O1xuXG4gIC8vIERldGVybWluZSB3aGV0aGVyIGFsbCBvZiB0aGUgZWxlbWVudHMgbWF0Y2ggYSB0cnV0aCB0ZXN0LlxuICAvLyBEZWxlZ2F0ZXMgdG8gKipFQ01BU2NyaXB0IDUqKidzIG5hdGl2ZSBgZXZlcnlgIGlmIGF2YWlsYWJsZS5cbiAgLy8gQWxpYXNlZCBhcyBgYWxsYC5cbiAgXy5ldmVyeSA9IF8uYWxsID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRvciwgY29udGV4dCkge1xuICAgIGl0ZXJhdG9yIHx8IChpdGVyYXRvciA9IF8uaWRlbnRpdHkpO1xuICAgIHZhciByZXN1bHQgPSB0cnVlO1xuICAgIGlmIChvYmogPT0gbnVsbCkgcmV0dXJuIHJlc3VsdDtcbiAgICBpZiAobmF0aXZlRXZlcnkgJiYgb2JqLmV2ZXJ5ID09PSBuYXRpdmVFdmVyeSkgcmV0dXJuIG9iai5ldmVyeShpdGVyYXRvciwgY29udGV4dCk7XG4gICAgZWFjaChvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgbGlzdCkge1xuICAgICAgaWYgKCEocmVzdWx0ID0gcmVzdWx0ICYmIGl0ZXJhdG9yLmNhbGwoY29udGV4dCwgdmFsdWUsIGluZGV4LCBsaXN0KSkpIHJldHVybiBicmVha2VyO1xuICAgIH0pO1xuICAgIHJldHVybiAhIXJlc3VsdDtcbiAgfTtcblxuICAvLyBEZXRlcm1pbmUgaWYgYXQgbGVhc3Qgb25lIGVsZW1lbnQgaW4gdGhlIG9iamVjdCBtYXRjaGVzIGEgdHJ1dGggdGVzdC5cbiAgLy8gRGVsZWdhdGVzIHRvICoqRUNNQVNjcmlwdCA1KioncyBuYXRpdmUgYHNvbWVgIGlmIGF2YWlsYWJsZS5cbiAgLy8gQWxpYXNlZCBhcyBgYW55YC5cbiAgdmFyIGFueSA9IF8uc29tZSA9IF8uYW55ID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRvciwgY29udGV4dCkge1xuICAgIGl0ZXJhdG9yIHx8IChpdGVyYXRvciA9IF8uaWRlbnRpdHkpO1xuICAgIHZhciByZXN1bHQgPSBmYWxzZTtcbiAgICBpZiAob2JqID09IG51bGwpIHJldHVybiByZXN1bHQ7XG4gICAgaWYgKG5hdGl2ZVNvbWUgJiYgb2JqLnNvbWUgPT09IG5hdGl2ZVNvbWUpIHJldHVybiBvYmouc29tZShpdGVyYXRvciwgY29udGV4dCk7XG4gICAgZWFjaChvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgbGlzdCkge1xuICAgICAgaWYgKHJlc3VsdCB8fCAocmVzdWx0ID0gaXRlcmF0b3IuY2FsbChjb250ZXh0LCB2YWx1ZSwgaW5kZXgsIGxpc3QpKSkgcmV0dXJuIGJyZWFrZXI7XG4gICAgfSk7XG4gICAgcmV0dXJuICEhcmVzdWx0O1xuICB9O1xuXG4gIC8vIERldGVybWluZSBpZiB0aGUgYXJyYXkgb3Igb2JqZWN0IGNvbnRhaW5zIGEgZ2l2ZW4gdmFsdWUgKHVzaW5nIGA9PT1gKS5cbiAgLy8gQWxpYXNlZCBhcyBgaW5jbHVkZWAuXG4gIF8uY29udGFpbnMgPSBfLmluY2x1ZGUgPSBmdW5jdGlvbihvYmosIHRhcmdldCkge1xuICAgIGlmIChvYmogPT0gbnVsbCkgcmV0dXJuIGZhbHNlO1xuICAgIGlmIChuYXRpdmVJbmRleE9mICYmIG9iai5pbmRleE9mID09PSBuYXRpdmVJbmRleE9mKSByZXR1cm4gb2JqLmluZGV4T2YodGFyZ2V0KSAhPSAtMTtcbiAgICByZXR1cm4gYW55KG9iaiwgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIHJldHVybiB2YWx1ZSA9PT0gdGFyZ2V0O1xuICAgIH0pO1xuICB9O1xuXG4gIC8vIEludm9rZSBhIG1ldGhvZCAod2l0aCBhcmd1bWVudHMpIG9uIGV2ZXJ5IGl0ZW0gaW4gYSBjb2xsZWN0aW9uLlxuICBfLmludm9rZSA9IGZ1bmN0aW9uKG9iaiwgbWV0aG9kKSB7XG4gICAgdmFyIGFyZ3MgPSBzbGljZS5jYWxsKGFyZ3VtZW50cywgMik7XG4gICAgdmFyIGlzRnVuYyA9IF8uaXNGdW5jdGlvbihtZXRob2QpO1xuICAgIHJldHVybiBfLm1hcChvYmosIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICByZXR1cm4gKGlzRnVuYyA/IG1ldGhvZCA6IHZhbHVlW21ldGhvZF0pLmFwcGx5KHZhbHVlLCBhcmdzKTtcbiAgICB9KTtcbiAgfTtcblxuICAvLyBDb252ZW5pZW5jZSB2ZXJzaW9uIG9mIGEgY29tbW9uIHVzZSBjYXNlIG9mIGBtYXBgOiBmZXRjaGluZyBhIHByb3BlcnR5LlxuICBfLnBsdWNrID0gZnVuY3Rpb24ob2JqLCBrZXkpIHtcbiAgICByZXR1cm4gXy5tYXAob2JqLCBmdW5jdGlvbih2YWx1ZSl7IHJldHVybiB2YWx1ZVtrZXldOyB9KTtcbiAgfTtcblxuICAvLyBDb252ZW5pZW5jZSB2ZXJzaW9uIG9mIGEgY29tbW9uIHVzZSBjYXNlIG9mIGBmaWx0ZXJgOiBzZWxlY3Rpbmcgb25seSBvYmplY3RzXG4gIC8vIGNvbnRhaW5pbmcgc3BlY2lmaWMgYGtleTp2YWx1ZWAgcGFpcnMuXG4gIF8ud2hlcmUgPSBmdW5jdGlvbihvYmosIGF0dHJzLCBmaXJzdCkge1xuICAgIGlmIChfLmlzRW1wdHkoYXR0cnMpKSByZXR1cm4gZmlyc3QgPyBudWxsIDogW107XG4gICAgcmV0dXJuIF9bZmlyc3QgPyAnZmluZCcgOiAnZmlsdGVyJ10ob2JqLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgZm9yICh2YXIga2V5IGluIGF0dHJzKSB7XG4gICAgICAgIGlmIChhdHRyc1trZXldICE9PSB2YWx1ZVtrZXldKSByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9KTtcbiAgfTtcblxuICAvLyBDb252ZW5pZW5jZSB2ZXJzaW9uIG9mIGEgY29tbW9uIHVzZSBjYXNlIG9mIGBmaW5kYDogZ2V0dGluZyB0aGUgZmlyc3Qgb2JqZWN0XG4gIC8vIGNvbnRhaW5pbmcgc3BlY2lmaWMgYGtleTp2YWx1ZWAgcGFpcnMuXG4gIF8uZmluZFdoZXJlID0gZnVuY3Rpb24ob2JqLCBhdHRycykge1xuICAgIHJldHVybiBfLndoZXJlKG9iaiwgYXR0cnMsIHRydWUpO1xuICB9O1xuXG4gIC8vIFJldHVybiB0aGUgbWF4aW11bSBlbGVtZW50IG9yIChlbGVtZW50LWJhc2VkIGNvbXB1dGF0aW9uKS5cbiAgLy8gQ2FuJ3Qgb3B0aW1pemUgYXJyYXlzIG9mIGludGVnZXJzIGxvbmdlciB0aGFuIDY1LDUzNSBlbGVtZW50cy5cbiAgLy8gU2VlOiBodHRwczovL2J1Z3Mud2Via2l0Lm9yZy9zaG93X2J1Zy5jZ2k/aWQ9ODA3OTdcbiAgXy5tYXggPSBmdW5jdGlvbihvYmosIGl0ZXJhdG9yLCBjb250ZXh0KSB7XG4gICAgaWYgKCFpdGVyYXRvciAmJiBfLmlzQXJyYXkob2JqKSAmJiBvYmpbMF0gPT09ICtvYmpbMF0gJiYgb2JqLmxlbmd0aCA8IDY1NTM1KSB7XG4gICAgICByZXR1cm4gTWF0aC5tYXguYXBwbHkoTWF0aCwgb2JqKTtcbiAgICB9XG4gICAgaWYgKCFpdGVyYXRvciAmJiBfLmlzRW1wdHkob2JqKSkgcmV0dXJuIC1JbmZpbml0eTtcbiAgICB2YXIgcmVzdWx0ID0ge2NvbXB1dGVkIDogLUluZmluaXR5LCB2YWx1ZTogLUluZmluaXR5fTtcbiAgICBlYWNoKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBsaXN0KSB7XG4gICAgICB2YXIgY29tcHV0ZWQgPSBpdGVyYXRvciA/IGl0ZXJhdG9yLmNhbGwoY29udGV4dCwgdmFsdWUsIGluZGV4LCBsaXN0KSA6IHZhbHVlO1xuICAgICAgY29tcHV0ZWQgPj0gcmVzdWx0LmNvbXB1dGVkICYmIChyZXN1bHQgPSB7dmFsdWUgOiB2YWx1ZSwgY29tcHV0ZWQgOiBjb21wdXRlZH0pO1xuICAgIH0pO1xuICAgIHJldHVybiByZXN1bHQudmFsdWU7XG4gIH07XG5cbiAgLy8gUmV0dXJuIHRoZSBtaW5pbXVtIGVsZW1lbnQgKG9yIGVsZW1lbnQtYmFzZWQgY29tcHV0YXRpb24pLlxuICBfLm1pbiA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0b3IsIGNvbnRleHQpIHtcbiAgICBpZiAoIWl0ZXJhdG9yICYmIF8uaXNBcnJheShvYmopICYmIG9ialswXSA9PT0gK29ialswXSAmJiBvYmoubGVuZ3RoIDwgNjU1MzUpIHtcbiAgICAgIHJldHVybiBNYXRoLm1pbi5hcHBseShNYXRoLCBvYmopO1xuICAgIH1cbiAgICBpZiAoIWl0ZXJhdG9yICYmIF8uaXNFbXB0eShvYmopKSByZXR1cm4gSW5maW5pdHk7XG4gICAgdmFyIHJlc3VsdCA9IHtjb21wdXRlZCA6IEluZmluaXR5LCB2YWx1ZTogSW5maW5pdHl9O1xuICAgIGVhY2gob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGxpc3QpIHtcbiAgICAgIHZhciBjb21wdXRlZCA9IGl0ZXJhdG9yID8gaXRlcmF0b3IuY2FsbChjb250ZXh0LCB2YWx1ZSwgaW5kZXgsIGxpc3QpIDogdmFsdWU7XG4gICAgICBjb21wdXRlZCA8IHJlc3VsdC5jb21wdXRlZCAmJiAocmVzdWx0ID0ge3ZhbHVlIDogdmFsdWUsIGNvbXB1dGVkIDogY29tcHV0ZWR9KTtcbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0LnZhbHVlO1xuICB9O1xuXG4gIC8vIFNodWZmbGUgYW4gYXJyYXkuXG4gIF8uc2h1ZmZsZSA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciByYW5kO1xuICAgIHZhciBpbmRleCA9IDA7XG4gICAgdmFyIHNodWZmbGVkID0gW107XG4gICAgZWFjaChvYmosIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICByYW5kID0gXy5yYW5kb20oaW5kZXgrKyk7XG4gICAgICBzaHVmZmxlZFtpbmRleCAtIDFdID0gc2h1ZmZsZWRbcmFuZF07XG4gICAgICBzaHVmZmxlZFtyYW5kXSA9IHZhbHVlO1xuICAgIH0pO1xuICAgIHJldHVybiBzaHVmZmxlZDtcbiAgfTtcblxuICAvLyBBbiBpbnRlcm5hbCBmdW5jdGlvbiB0byBnZW5lcmF0ZSBsb29rdXAgaXRlcmF0b3JzLlxuICB2YXIgbG9va3VwSXRlcmF0b3IgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgIHJldHVybiBfLmlzRnVuY3Rpb24odmFsdWUpID8gdmFsdWUgOiBmdW5jdGlvbihvYmopeyByZXR1cm4gb2JqW3ZhbHVlXTsgfTtcbiAgfTtcblxuICAvLyBTb3J0IHRoZSBvYmplY3QncyB2YWx1ZXMgYnkgYSBjcml0ZXJpb24gcHJvZHVjZWQgYnkgYW4gaXRlcmF0b3IuXG4gIF8uc29ydEJ5ID0gZnVuY3Rpb24ob2JqLCB2YWx1ZSwgY29udGV4dCkge1xuICAgIHZhciBpdGVyYXRvciA9IGxvb2t1cEl0ZXJhdG9yKHZhbHVlKTtcbiAgICByZXR1cm4gXy5wbHVjayhfLm1hcChvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgbGlzdCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdmFsdWUgOiB2YWx1ZSxcbiAgICAgICAgaW5kZXggOiBpbmRleCxcbiAgICAgICAgY3JpdGVyaWEgOiBpdGVyYXRvci5jYWxsKGNvbnRleHQsIHZhbHVlLCBpbmRleCwgbGlzdClcbiAgICAgIH07XG4gICAgfSkuc29ydChmdW5jdGlvbihsZWZ0LCByaWdodCkge1xuICAgICAgdmFyIGEgPSBsZWZ0LmNyaXRlcmlhO1xuICAgICAgdmFyIGIgPSByaWdodC5jcml0ZXJpYTtcbiAgICAgIGlmIChhICE9PSBiKSB7XG4gICAgICAgIGlmIChhID4gYiB8fCBhID09PSB2b2lkIDApIHJldHVybiAxO1xuICAgICAgICBpZiAoYSA8IGIgfHwgYiA9PT0gdm9pZCAwKSByZXR1cm4gLTE7XG4gICAgICB9XG4gICAgICByZXR1cm4gbGVmdC5pbmRleCA8IHJpZ2h0LmluZGV4ID8gLTEgOiAxO1xuICAgIH0pLCAndmFsdWUnKTtcbiAgfTtcblxuICAvLyBBbiBpbnRlcm5hbCBmdW5jdGlvbiB1c2VkIGZvciBhZ2dyZWdhdGUgXCJncm91cCBieVwiIG9wZXJhdGlvbnMuXG4gIHZhciBncm91cCA9IGZ1bmN0aW9uKG9iaiwgdmFsdWUsIGNvbnRleHQsIGJlaGF2aW9yKSB7XG4gICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgIHZhciBpdGVyYXRvciA9IGxvb2t1cEl0ZXJhdG9yKHZhbHVlIHx8IF8uaWRlbnRpdHkpO1xuICAgIGVhY2gob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgpIHtcbiAgICAgIHZhciBrZXkgPSBpdGVyYXRvci5jYWxsKGNvbnRleHQsIHZhbHVlLCBpbmRleCwgb2JqKTtcbiAgICAgIGJlaGF2aW9yKHJlc3VsdCwga2V5LCB2YWx1ZSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBHcm91cHMgdGhlIG9iamVjdCdzIHZhbHVlcyBieSBhIGNyaXRlcmlvbi4gUGFzcyBlaXRoZXIgYSBzdHJpbmcgYXR0cmlidXRlXG4gIC8vIHRvIGdyb3VwIGJ5LCBvciBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyB0aGUgY3JpdGVyaW9uLlxuICBfLmdyb3VwQnkgPSBmdW5jdGlvbihvYmosIHZhbHVlLCBjb250ZXh0KSB7XG4gICAgcmV0dXJuIGdyb3VwKG9iaiwgdmFsdWUsIGNvbnRleHQsIGZ1bmN0aW9uKHJlc3VsdCwga2V5LCB2YWx1ZSkge1xuICAgICAgKF8uaGFzKHJlc3VsdCwga2V5KSA/IHJlc3VsdFtrZXldIDogKHJlc3VsdFtrZXldID0gW10pKS5wdXNoKHZhbHVlKTtcbiAgICB9KTtcbiAgfTtcblxuICAvLyBDb3VudHMgaW5zdGFuY2VzIG9mIGFuIG9iamVjdCB0aGF0IGdyb3VwIGJ5IGEgY2VydGFpbiBjcml0ZXJpb24uIFBhc3NcbiAgLy8gZWl0aGVyIGEgc3RyaW5nIGF0dHJpYnV0ZSB0byBjb3VudCBieSwgb3IgYSBmdW5jdGlvbiB0aGF0IHJldHVybnMgdGhlXG4gIC8vIGNyaXRlcmlvbi5cbiAgXy5jb3VudEJ5ID0gZnVuY3Rpb24ob2JqLCB2YWx1ZSwgY29udGV4dCkge1xuICAgIHJldHVybiBncm91cChvYmosIHZhbHVlLCBjb250ZXh0LCBmdW5jdGlvbihyZXN1bHQsIGtleSkge1xuICAgICAgaWYgKCFfLmhhcyhyZXN1bHQsIGtleSkpIHJlc3VsdFtrZXldID0gMDtcbiAgICAgIHJlc3VsdFtrZXldKys7XG4gICAgfSk7XG4gIH07XG5cbiAgLy8gVXNlIGEgY29tcGFyYXRvciBmdW5jdGlvbiB0byBmaWd1cmUgb3V0IHRoZSBzbWFsbGVzdCBpbmRleCBhdCB3aGljaFxuICAvLyBhbiBvYmplY3Qgc2hvdWxkIGJlIGluc2VydGVkIHNvIGFzIHRvIG1haW50YWluIG9yZGVyLiBVc2VzIGJpbmFyeSBzZWFyY2guXG4gIF8uc29ydGVkSW5kZXggPSBmdW5jdGlvbihhcnJheSwgb2JqLCBpdGVyYXRvciwgY29udGV4dCkge1xuICAgIGl0ZXJhdG9yID0gaXRlcmF0b3IgPT0gbnVsbCA/IF8uaWRlbnRpdHkgOiBsb29rdXBJdGVyYXRvcihpdGVyYXRvcik7XG4gICAgdmFyIHZhbHVlID0gaXRlcmF0b3IuY2FsbChjb250ZXh0LCBvYmopO1xuICAgIHZhciBsb3cgPSAwLCBoaWdoID0gYXJyYXkubGVuZ3RoO1xuICAgIHdoaWxlIChsb3cgPCBoaWdoKSB7XG4gICAgICB2YXIgbWlkID0gKGxvdyArIGhpZ2gpID4+PiAxO1xuICAgICAgaXRlcmF0b3IuY2FsbChjb250ZXh0LCBhcnJheVttaWRdKSA8IHZhbHVlID8gbG93ID0gbWlkICsgMSA6IGhpZ2ggPSBtaWQ7XG4gICAgfVxuICAgIHJldHVybiBsb3c7XG4gIH07XG5cbiAgLy8gU2FmZWx5IGNvbnZlcnQgYW55dGhpbmcgaXRlcmFibGUgaW50byBhIHJlYWwsIGxpdmUgYXJyYXkuXG4gIF8udG9BcnJheSA9IGZ1bmN0aW9uKG9iaikge1xuICAgIGlmICghb2JqKSByZXR1cm4gW107XG4gICAgaWYgKF8uaXNBcnJheShvYmopKSByZXR1cm4gc2xpY2UuY2FsbChvYmopO1xuICAgIGlmIChvYmoubGVuZ3RoID09PSArb2JqLmxlbmd0aCkgcmV0dXJuIF8ubWFwKG9iaiwgXy5pZGVudGl0eSk7XG4gICAgcmV0dXJuIF8udmFsdWVzKG9iaik7XG4gIH07XG5cbiAgLy8gUmV0dXJuIHRoZSBudW1iZXIgb2YgZWxlbWVudHMgaW4gYW4gb2JqZWN0LlxuICBfLnNpemUgPSBmdW5jdGlvbihvYmopIHtcbiAgICBpZiAob2JqID09IG51bGwpIHJldHVybiAwO1xuICAgIHJldHVybiAob2JqLmxlbmd0aCA9PT0gK29iai5sZW5ndGgpID8gb2JqLmxlbmd0aCA6IF8ua2V5cyhvYmopLmxlbmd0aDtcbiAgfTtcblxuICAvLyBBcnJheSBGdW5jdGlvbnNcbiAgLy8gLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gR2V0IHRoZSBmaXJzdCBlbGVtZW50IG9mIGFuIGFycmF5LiBQYXNzaW5nICoqbioqIHdpbGwgcmV0dXJuIHRoZSBmaXJzdCBOXG4gIC8vIHZhbHVlcyBpbiB0aGUgYXJyYXkuIEFsaWFzZWQgYXMgYGhlYWRgIGFuZCBgdGFrZWAuIFRoZSAqKmd1YXJkKiogY2hlY2tcbiAgLy8gYWxsb3dzIGl0IHRvIHdvcmsgd2l0aCBgXy5tYXBgLlxuICBfLmZpcnN0ID0gXy5oZWFkID0gXy50YWtlID0gZnVuY3Rpb24oYXJyYXksIG4sIGd1YXJkKSB7XG4gICAgaWYgKGFycmF5ID09IG51bGwpIHJldHVybiB2b2lkIDA7XG4gICAgcmV0dXJuIChuICE9IG51bGwpICYmICFndWFyZCA/IHNsaWNlLmNhbGwoYXJyYXksIDAsIG4pIDogYXJyYXlbMF07XG4gIH07XG5cbiAgLy8gUmV0dXJucyBldmVyeXRoaW5nIGJ1dCB0aGUgbGFzdCBlbnRyeSBvZiB0aGUgYXJyYXkuIEVzcGVjaWFsbHkgdXNlZnVsIG9uXG4gIC8vIHRoZSBhcmd1bWVudHMgb2JqZWN0LiBQYXNzaW5nICoqbioqIHdpbGwgcmV0dXJuIGFsbCB0aGUgdmFsdWVzIGluXG4gIC8vIHRoZSBhcnJheSwgZXhjbHVkaW5nIHRoZSBsYXN0IE4uIFRoZSAqKmd1YXJkKiogY2hlY2sgYWxsb3dzIGl0IHRvIHdvcmsgd2l0aFxuICAvLyBgXy5tYXBgLlxuICBfLmluaXRpYWwgPSBmdW5jdGlvbihhcnJheSwgbiwgZ3VhcmQpIHtcbiAgICByZXR1cm4gc2xpY2UuY2FsbChhcnJheSwgMCwgYXJyYXkubGVuZ3RoIC0gKChuID09IG51bGwpIHx8IGd1YXJkID8gMSA6IG4pKTtcbiAgfTtcblxuICAvLyBHZXQgdGhlIGxhc3QgZWxlbWVudCBvZiBhbiBhcnJheS4gUGFzc2luZyAqKm4qKiB3aWxsIHJldHVybiB0aGUgbGFzdCBOXG4gIC8vIHZhbHVlcyBpbiB0aGUgYXJyYXkuIFRoZSAqKmd1YXJkKiogY2hlY2sgYWxsb3dzIGl0IHRvIHdvcmsgd2l0aCBgXy5tYXBgLlxuICBfLmxhc3QgPSBmdW5jdGlvbihhcnJheSwgbiwgZ3VhcmQpIHtcbiAgICBpZiAoYXJyYXkgPT0gbnVsbCkgcmV0dXJuIHZvaWQgMDtcbiAgICBpZiAoKG4gIT0gbnVsbCkgJiYgIWd1YXJkKSB7XG4gICAgICByZXR1cm4gc2xpY2UuY2FsbChhcnJheSwgTWF0aC5tYXgoYXJyYXkubGVuZ3RoIC0gbiwgMCkpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gYXJyYXlbYXJyYXkubGVuZ3RoIC0gMV07XG4gICAgfVxuICB9O1xuXG4gIC8vIFJldHVybnMgZXZlcnl0aGluZyBidXQgdGhlIGZpcnN0IGVudHJ5IG9mIHRoZSBhcnJheS4gQWxpYXNlZCBhcyBgdGFpbGAgYW5kIGBkcm9wYC5cbiAgLy8gRXNwZWNpYWxseSB1c2VmdWwgb24gdGhlIGFyZ3VtZW50cyBvYmplY3QuIFBhc3NpbmcgYW4gKipuKiogd2lsbCByZXR1cm5cbiAgLy8gdGhlIHJlc3QgTiB2YWx1ZXMgaW4gdGhlIGFycmF5LiBUaGUgKipndWFyZCoqXG4gIC8vIGNoZWNrIGFsbG93cyBpdCB0byB3b3JrIHdpdGggYF8ubWFwYC5cbiAgXy5yZXN0ID0gXy50YWlsID0gXy5kcm9wID0gZnVuY3Rpb24oYXJyYXksIG4sIGd1YXJkKSB7XG4gICAgcmV0dXJuIHNsaWNlLmNhbGwoYXJyYXksIChuID09IG51bGwpIHx8IGd1YXJkID8gMSA6IG4pO1xuICB9O1xuXG4gIC8vIFRyaW0gb3V0IGFsbCBmYWxzeSB2YWx1ZXMgZnJvbSBhbiBhcnJheS5cbiAgXy5jb21wYWN0ID0gZnVuY3Rpb24oYXJyYXkpIHtcbiAgICByZXR1cm4gXy5maWx0ZXIoYXJyYXksIF8uaWRlbnRpdHkpO1xuICB9O1xuXG4gIC8vIEludGVybmFsIGltcGxlbWVudGF0aW9uIG9mIGEgcmVjdXJzaXZlIGBmbGF0dGVuYCBmdW5jdGlvbi5cbiAgdmFyIGZsYXR0ZW4gPSBmdW5jdGlvbihpbnB1dCwgc2hhbGxvdywgb3V0cHV0KSB7XG4gICAgZWFjaChpbnB1dCwgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIGlmIChfLmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgIHNoYWxsb3cgPyBwdXNoLmFwcGx5KG91dHB1dCwgdmFsdWUpIDogZmxhdHRlbih2YWx1ZSwgc2hhbGxvdywgb3V0cHV0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG91dHB1dC5wdXNoKHZhbHVlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gb3V0cHV0O1xuICB9O1xuXG4gIC8vIFJldHVybiBhIGNvbXBsZXRlbHkgZmxhdHRlbmVkIHZlcnNpb24gb2YgYW4gYXJyYXkuXG4gIF8uZmxhdHRlbiA9IGZ1bmN0aW9uKGFycmF5LCBzaGFsbG93KSB7XG4gICAgcmV0dXJuIGZsYXR0ZW4oYXJyYXksIHNoYWxsb3csIFtdKTtcbiAgfTtcblxuICAvLyBSZXR1cm4gYSB2ZXJzaW9uIG9mIHRoZSBhcnJheSB0aGF0IGRvZXMgbm90IGNvbnRhaW4gdGhlIHNwZWNpZmllZCB2YWx1ZShzKS5cbiAgXy53aXRob3V0ID0gZnVuY3Rpb24oYXJyYXkpIHtcbiAgICByZXR1cm4gXy5kaWZmZXJlbmNlKGFycmF5LCBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSkpO1xuICB9O1xuXG4gIC8vIFByb2R1Y2UgYSBkdXBsaWNhdGUtZnJlZSB2ZXJzaW9uIG9mIHRoZSBhcnJheS4gSWYgdGhlIGFycmF5IGhhcyBhbHJlYWR5XG4gIC8vIGJlZW4gc29ydGVkLCB5b3UgaGF2ZSB0aGUgb3B0aW9uIG9mIHVzaW5nIGEgZmFzdGVyIGFsZ29yaXRobS5cbiAgLy8gQWxpYXNlZCBhcyBgdW5pcXVlYC5cbiAgXy51bmlxID0gXy51bmlxdWUgPSBmdW5jdGlvbihhcnJheSwgaXNTb3J0ZWQsIGl0ZXJhdG9yLCBjb250ZXh0KSB7XG4gICAgaWYgKF8uaXNGdW5jdGlvbihpc1NvcnRlZCkpIHtcbiAgICAgIGNvbnRleHQgPSBpdGVyYXRvcjtcbiAgICAgIGl0ZXJhdG9yID0gaXNTb3J0ZWQ7XG4gICAgICBpc1NvcnRlZCA9IGZhbHNlO1xuICAgIH1cbiAgICB2YXIgaW5pdGlhbCA9IGl0ZXJhdG9yID8gXy5tYXAoYXJyYXksIGl0ZXJhdG9yLCBjb250ZXh0KSA6IGFycmF5O1xuICAgIHZhciByZXN1bHRzID0gW107XG4gICAgdmFyIHNlZW4gPSBbXTtcbiAgICBlYWNoKGluaXRpYWwsIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCkge1xuICAgICAgaWYgKGlzU29ydGVkID8gKCFpbmRleCB8fCBzZWVuW3NlZW4ubGVuZ3RoIC0gMV0gIT09IHZhbHVlKSA6ICFfLmNvbnRhaW5zKHNlZW4sIHZhbHVlKSkge1xuICAgICAgICBzZWVuLnB1c2godmFsdWUpO1xuICAgICAgICByZXN1bHRzLnB1c2goYXJyYXlbaW5kZXhdKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfTtcblxuICAvLyBQcm9kdWNlIGFuIGFycmF5IHRoYXQgY29udGFpbnMgdGhlIHVuaW9uOiBlYWNoIGRpc3RpbmN0IGVsZW1lbnQgZnJvbSBhbGwgb2ZcbiAgLy8gdGhlIHBhc3NlZC1pbiBhcnJheXMuXG4gIF8udW5pb24gPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gXy51bmlxKGNvbmNhdC5hcHBseShBcnJheVByb3RvLCBhcmd1bWVudHMpKTtcbiAgfTtcblxuICAvLyBQcm9kdWNlIGFuIGFycmF5IHRoYXQgY29udGFpbnMgZXZlcnkgaXRlbSBzaGFyZWQgYmV0d2VlbiBhbGwgdGhlXG4gIC8vIHBhc3NlZC1pbiBhcnJheXMuXG4gIF8uaW50ZXJzZWN0aW9uID0gZnVuY3Rpb24oYXJyYXkpIHtcbiAgICB2YXIgcmVzdCA9IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICByZXR1cm4gXy5maWx0ZXIoXy51bmlxKGFycmF5KSwgZnVuY3Rpb24oaXRlbSkge1xuICAgICAgcmV0dXJuIF8uZXZlcnkocmVzdCwgZnVuY3Rpb24ob3RoZXIpIHtcbiAgICAgICAgcmV0dXJuIF8uaW5kZXhPZihvdGhlciwgaXRlbSkgPj0gMDtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9O1xuXG4gIC8vIFRha2UgdGhlIGRpZmZlcmVuY2UgYmV0d2VlbiBvbmUgYXJyYXkgYW5kIGEgbnVtYmVyIG9mIG90aGVyIGFycmF5cy5cbiAgLy8gT25seSB0aGUgZWxlbWVudHMgcHJlc2VudCBpbiBqdXN0IHRoZSBmaXJzdCBhcnJheSB3aWxsIHJlbWFpbi5cbiAgXy5kaWZmZXJlbmNlID0gZnVuY3Rpb24oYXJyYXkpIHtcbiAgICB2YXIgcmVzdCA9IGNvbmNhdC5hcHBseShBcnJheVByb3RvLCBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSkpO1xuICAgIHJldHVybiBfLmZpbHRlcihhcnJheSwgZnVuY3Rpb24odmFsdWUpeyByZXR1cm4gIV8uY29udGFpbnMocmVzdCwgdmFsdWUpOyB9KTtcbiAgfTtcblxuICAvLyBaaXAgdG9nZXRoZXIgbXVsdGlwbGUgbGlzdHMgaW50byBhIHNpbmdsZSBhcnJheSAtLSBlbGVtZW50cyB0aGF0IHNoYXJlXG4gIC8vIGFuIGluZGV4IGdvIHRvZ2V0aGVyLlxuICBfLnppcCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBhcmdzID0gc2xpY2UuY2FsbChhcmd1bWVudHMpO1xuICAgIHZhciBsZW5ndGggPSBfLm1heChfLnBsdWNrKGFyZ3MsICdsZW5ndGgnKSk7XG4gICAgdmFyIHJlc3VsdHMgPSBuZXcgQXJyYXkobGVuZ3RoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICByZXN1bHRzW2ldID0gXy5wbHVjayhhcmdzLCBcIlwiICsgaSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzO1xuICB9O1xuXG4gIC8vIENvbnZlcnRzIGxpc3RzIGludG8gb2JqZWN0cy4gUGFzcyBlaXRoZXIgYSBzaW5nbGUgYXJyYXkgb2YgYFtrZXksIHZhbHVlXWBcbiAgLy8gcGFpcnMsIG9yIHR3byBwYXJhbGxlbCBhcnJheXMgb2YgdGhlIHNhbWUgbGVuZ3RoIC0tIG9uZSBvZiBrZXlzLCBhbmQgb25lIG9mXG4gIC8vIHRoZSBjb3JyZXNwb25kaW5nIHZhbHVlcy5cbiAgXy5vYmplY3QgPSBmdW5jdGlvbihsaXN0LCB2YWx1ZXMpIHtcbiAgICBpZiAobGlzdCA9PSBudWxsKSByZXR1cm4ge307XG4gICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgIGZvciAodmFyIGkgPSAwLCBsID0gbGlzdC5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIGlmICh2YWx1ZXMpIHtcbiAgICAgICAgcmVzdWx0W2xpc3RbaV1dID0gdmFsdWVzW2ldO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzdWx0W2xpc3RbaV1bMF1dID0gbGlzdFtpXVsxXTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBJZiB0aGUgYnJvd3NlciBkb2Vzbid0IHN1cHBseSB1cyB3aXRoIGluZGV4T2YgKEknbSBsb29raW5nIGF0IHlvdSwgKipNU0lFKiopLFxuICAvLyB3ZSBuZWVkIHRoaXMgZnVuY3Rpb24uIFJldHVybiB0aGUgcG9zaXRpb24gb2YgdGhlIGZpcnN0IG9jY3VycmVuY2Ugb2YgYW5cbiAgLy8gaXRlbSBpbiBhbiBhcnJheSwgb3IgLTEgaWYgdGhlIGl0ZW0gaXMgbm90IGluY2x1ZGVkIGluIHRoZSBhcnJheS5cbiAgLy8gRGVsZWdhdGVzIHRvICoqRUNNQVNjcmlwdCA1KioncyBuYXRpdmUgYGluZGV4T2ZgIGlmIGF2YWlsYWJsZS5cbiAgLy8gSWYgdGhlIGFycmF5IGlzIGxhcmdlIGFuZCBhbHJlYWR5IGluIHNvcnQgb3JkZXIsIHBhc3MgYHRydWVgXG4gIC8vIGZvciAqKmlzU29ydGVkKiogdG8gdXNlIGJpbmFyeSBzZWFyY2guXG4gIF8uaW5kZXhPZiA9IGZ1bmN0aW9uKGFycmF5LCBpdGVtLCBpc1NvcnRlZCkge1xuICAgIGlmIChhcnJheSA9PSBudWxsKSByZXR1cm4gLTE7XG4gICAgdmFyIGkgPSAwLCBsID0gYXJyYXkubGVuZ3RoO1xuICAgIGlmIChpc1NvcnRlZCkge1xuICAgICAgaWYgKHR5cGVvZiBpc1NvcnRlZCA9PSAnbnVtYmVyJykge1xuICAgICAgICBpID0gKGlzU29ydGVkIDwgMCA/IE1hdGgubWF4KDAsIGwgKyBpc1NvcnRlZCkgOiBpc1NvcnRlZCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpID0gXy5zb3J0ZWRJbmRleChhcnJheSwgaXRlbSk7XG4gICAgICAgIHJldHVybiBhcnJheVtpXSA9PT0gaXRlbSA/IGkgOiAtMTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKG5hdGl2ZUluZGV4T2YgJiYgYXJyYXkuaW5kZXhPZiA9PT0gbmF0aXZlSW5kZXhPZikgcmV0dXJuIGFycmF5LmluZGV4T2YoaXRlbSwgaXNTb3J0ZWQpO1xuICAgIGZvciAoOyBpIDwgbDsgaSsrKSBpZiAoYXJyYXlbaV0gPT09IGl0ZW0pIHJldHVybiBpO1xuICAgIHJldHVybiAtMTtcbiAgfTtcblxuICAvLyBEZWxlZ2F0ZXMgdG8gKipFQ01BU2NyaXB0IDUqKidzIG5hdGl2ZSBgbGFzdEluZGV4T2ZgIGlmIGF2YWlsYWJsZS5cbiAgXy5sYXN0SW5kZXhPZiA9IGZ1bmN0aW9uKGFycmF5LCBpdGVtLCBmcm9tKSB7XG4gICAgaWYgKGFycmF5ID09IG51bGwpIHJldHVybiAtMTtcbiAgICB2YXIgaGFzSW5kZXggPSBmcm9tICE9IG51bGw7XG4gICAgaWYgKG5hdGl2ZUxhc3RJbmRleE9mICYmIGFycmF5Lmxhc3RJbmRleE9mID09PSBuYXRpdmVMYXN0SW5kZXhPZikge1xuICAgICAgcmV0dXJuIGhhc0luZGV4ID8gYXJyYXkubGFzdEluZGV4T2YoaXRlbSwgZnJvbSkgOiBhcnJheS5sYXN0SW5kZXhPZihpdGVtKTtcbiAgICB9XG4gICAgdmFyIGkgPSAoaGFzSW5kZXggPyBmcm9tIDogYXJyYXkubGVuZ3RoKTtcbiAgICB3aGlsZSAoaS0tKSBpZiAoYXJyYXlbaV0gPT09IGl0ZW0pIHJldHVybiBpO1xuICAgIHJldHVybiAtMTtcbiAgfTtcblxuICAvLyBHZW5lcmF0ZSBhbiBpbnRlZ2VyIEFycmF5IGNvbnRhaW5pbmcgYW4gYXJpdGhtZXRpYyBwcm9ncmVzc2lvbi4gQSBwb3J0IG9mXG4gIC8vIHRoZSBuYXRpdmUgUHl0aG9uIGByYW5nZSgpYCBmdW5jdGlvbi4gU2VlXG4gIC8vIFt0aGUgUHl0aG9uIGRvY3VtZW50YXRpb25dKGh0dHA6Ly9kb2NzLnB5dGhvbi5vcmcvbGlicmFyeS9mdW5jdGlvbnMuaHRtbCNyYW5nZSkuXG4gIF8ucmFuZ2UgPSBmdW5jdGlvbihzdGFydCwgc3RvcCwgc3RlcCkge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoIDw9IDEpIHtcbiAgICAgIHN0b3AgPSBzdGFydCB8fCAwO1xuICAgICAgc3RhcnQgPSAwO1xuICAgIH1cbiAgICBzdGVwID0gYXJndW1lbnRzWzJdIHx8IDE7XG5cbiAgICB2YXIgbGVuID0gTWF0aC5tYXgoTWF0aC5jZWlsKChzdG9wIC0gc3RhcnQpIC8gc3RlcCksIDApO1xuICAgIHZhciBpZHggPSAwO1xuICAgIHZhciByYW5nZSA9IG5ldyBBcnJheShsZW4pO1xuXG4gICAgd2hpbGUoaWR4IDwgbGVuKSB7XG4gICAgICByYW5nZVtpZHgrK10gPSBzdGFydDtcbiAgICAgIHN0YXJ0ICs9IHN0ZXA7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJhbmdlO1xuICB9O1xuXG4gIC8vIEZ1bmN0aW9uIChhaGVtKSBGdW5jdGlvbnNcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gQ3JlYXRlIGEgZnVuY3Rpb24gYm91bmQgdG8gYSBnaXZlbiBvYmplY3QgKGFzc2lnbmluZyBgdGhpc2AsIGFuZCBhcmd1bWVudHMsXG4gIC8vIG9wdGlvbmFsbHkpLiBEZWxlZ2F0ZXMgdG8gKipFQ01BU2NyaXB0IDUqKidzIG5hdGl2ZSBgRnVuY3Rpb24uYmluZGAgaWZcbiAgLy8gYXZhaWxhYmxlLlxuICBfLmJpbmQgPSBmdW5jdGlvbihmdW5jLCBjb250ZXh0KSB7XG4gICAgaWYgKGZ1bmMuYmluZCA9PT0gbmF0aXZlQmluZCAmJiBuYXRpdmVCaW5kKSByZXR1cm4gbmF0aXZlQmluZC5hcHBseShmdW5jLCBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSkpO1xuICAgIHZhciBhcmdzID0gc2xpY2UuY2FsbChhcmd1bWVudHMsIDIpO1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MuY29uY2F0KHNsaWNlLmNhbGwoYXJndW1lbnRzKSkpO1xuICAgIH07XG4gIH07XG5cbiAgLy8gUGFydGlhbGx5IGFwcGx5IGEgZnVuY3Rpb24gYnkgY3JlYXRpbmcgYSB2ZXJzaW9uIHRoYXQgaGFzIGhhZCBzb21lIG9mIGl0c1xuICAvLyBhcmd1bWVudHMgcHJlLWZpbGxlZCwgd2l0aG91dCBjaGFuZ2luZyBpdHMgZHluYW1pYyBgdGhpc2AgY29udGV4dC5cbiAgXy5wYXJ0aWFsID0gZnVuY3Rpb24oZnVuYykge1xuICAgIHZhciBhcmdzID0gc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBmdW5jLmFwcGx5KHRoaXMsIGFyZ3MuY29uY2F0KHNsaWNlLmNhbGwoYXJndW1lbnRzKSkpO1xuICAgIH07XG4gIH07XG5cbiAgLy8gQmluZCBhbGwgb2YgYW4gb2JqZWN0J3MgbWV0aG9kcyB0byB0aGF0IG9iamVjdC4gVXNlZnVsIGZvciBlbnN1cmluZyB0aGF0XG4gIC8vIGFsbCBjYWxsYmFja3MgZGVmaW5lZCBvbiBhbiBvYmplY3QgYmVsb25nIHRvIGl0LlxuICBfLmJpbmRBbGwgPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIgZnVuY3MgPSBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgaWYgKGZ1bmNzLmxlbmd0aCA9PT0gMCkgZnVuY3MgPSBfLmZ1bmN0aW9ucyhvYmopO1xuICAgIGVhY2goZnVuY3MsIGZ1bmN0aW9uKGYpIHsgb2JqW2ZdID0gXy5iaW5kKG9ialtmXSwgb2JqKTsgfSk7XG4gICAgcmV0dXJuIG9iajtcbiAgfTtcblxuICAvLyBNZW1vaXplIGFuIGV4cGVuc2l2ZSBmdW5jdGlvbiBieSBzdG9yaW5nIGl0cyByZXN1bHRzLlxuICBfLm1lbW9pemUgPSBmdW5jdGlvbihmdW5jLCBoYXNoZXIpIHtcbiAgICB2YXIgbWVtbyA9IHt9O1xuICAgIGhhc2hlciB8fCAoaGFzaGVyID0gXy5pZGVudGl0eSk7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGtleSA9IGhhc2hlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgcmV0dXJuIF8uaGFzKG1lbW8sIGtleSkgPyBtZW1vW2tleV0gOiAobWVtb1trZXldID0gZnVuYy5hcHBseSh0aGlzLCBhcmd1bWVudHMpKTtcbiAgICB9O1xuICB9O1xuXG4gIC8vIERlbGF5cyBhIGZ1bmN0aW9uIGZvciB0aGUgZ2l2ZW4gbnVtYmVyIG9mIG1pbGxpc2Vjb25kcywgYW5kIHRoZW4gY2FsbHNcbiAgLy8gaXQgd2l0aCB0aGUgYXJndW1lbnRzIHN1cHBsaWVkLlxuICBfLmRlbGF5ID0gZnVuY3Rpb24oZnVuYywgd2FpdCkge1xuICAgIHZhciBhcmdzID0gc2xpY2UuY2FsbChhcmd1bWVudHMsIDIpO1xuICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7IHJldHVybiBmdW5jLmFwcGx5KG51bGwsIGFyZ3MpOyB9LCB3YWl0KTtcbiAgfTtcblxuICAvLyBEZWZlcnMgYSBmdW5jdGlvbiwgc2NoZWR1bGluZyBpdCB0byBydW4gYWZ0ZXIgdGhlIGN1cnJlbnQgY2FsbCBzdGFjayBoYXNcbiAgLy8gY2xlYXJlZC5cbiAgXy5kZWZlciA9IGZ1bmN0aW9uKGZ1bmMpIHtcbiAgICByZXR1cm4gXy5kZWxheS5hcHBseShfLCBbZnVuYywgMV0uY29uY2F0KHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSkpO1xuICB9O1xuXG4gIC8vIFJldHVybnMgYSBmdW5jdGlvbiwgdGhhdCwgd2hlbiBpbnZva2VkLCB3aWxsIG9ubHkgYmUgdHJpZ2dlcmVkIGF0IG1vc3Qgb25jZVxuICAvLyBkdXJpbmcgYSBnaXZlbiB3aW5kb3cgb2YgdGltZS5cbiAgXy50aHJvdHRsZSA9IGZ1bmN0aW9uKGZ1bmMsIHdhaXQpIHtcbiAgICB2YXIgY29udGV4dCwgYXJncywgdGltZW91dCwgcmVzdWx0O1xuICAgIHZhciBwcmV2aW91cyA9IDA7XG4gICAgdmFyIGxhdGVyID0gZnVuY3Rpb24oKSB7XG4gICAgICBwcmV2aW91cyA9IG5ldyBEYXRlO1xuICAgICAgdGltZW91dCA9IG51bGw7XG4gICAgICByZXN1bHQgPSBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgIH07XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIG5vdyA9IG5ldyBEYXRlO1xuICAgICAgdmFyIHJlbWFpbmluZyA9IHdhaXQgLSAobm93IC0gcHJldmlvdXMpO1xuICAgICAgY29udGV4dCA9IHRoaXM7XG4gICAgICBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgaWYgKHJlbWFpbmluZyA8PSAwKSB7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICAgICAgdGltZW91dCA9IG51bGw7XG4gICAgICAgIHByZXZpb3VzID0gbm93O1xuICAgICAgICByZXN1bHQgPSBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgfSBlbHNlIGlmICghdGltZW91dCkge1xuICAgICAgICB0aW1lb3V0ID0gc2V0VGltZW91dChsYXRlciwgcmVtYWluaW5nKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGEgZnVuY3Rpb24sIHRoYXQsIGFzIGxvbmcgYXMgaXQgY29udGludWVzIHRvIGJlIGludm9rZWQsIHdpbGwgbm90XG4gIC8vIGJlIHRyaWdnZXJlZC4gVGhlIGZ1bmN0aW9uIHdpbGwgYmUgY2FsbGVkIGFmdGVyIGl0IHN0b3BzIGJlaW5nIGNhbGxlZCBmb3JcbiAgLy8gTiBtaWxsaXNlY29uZHMuIElmIGBpbW1lZGlhdGVgIGlzIHBhc3NlZCwgdHJpZ2dlciB0aGUgZnVuY3Rpb24gb24gdGhlXG4gIC8vIGxlYWRpbmcgZWRnZSwgaW5zdGVhZCBvZiB0aGUgdHJhaWxpbmcuXG4gIF8uZGVib3VuY2UgPSBmdW5jdGlvbihmdW5jLCB3YWl0LCBpbW1lZGlhdGUpIHtcbiAgICB2YXIgdGltZW91dCwgcmVzdWx0O1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBjb250ZXh0ID0gdGhpcywgYXJncyA9IGFyZ3VtZW50cztcbiAgICAgIHZhciBsYXRlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aW1lb3V0ID0gbnVsbDtcbiAgICAgICAgaWYgKCFpbW1lZGlhdGUpIHJlc3VsdCA9IGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgICB9O1xuICAgICAgdmFyIGNhbGxOb3cgPSBpbW1lZGlhdGUgJiYgIXRpbWVvdXQ7XG4gICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgICB0aW1lb3V0ID0gc2V0VGltZW91dChsYXRlciwgd2FpdCk7XG4gICAgICBpZiAoY2FsbE5vdykgcmVzdWx0ID0gZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGEgZnVuY3Rpb24gdGhhdCB3aWxsIGJlIGV4ZWN1dGVkIGF0IG1vc3Qgb25lIHRpbWUsIG5vIG1hdHRlciBob3dcbiAgLy8gb2Z0ZW4geW91IGNhbGwgaXQuIFVzZWZ1bCBmb3IgbGF6eSBpbml0aWFsaXphdGlvbi5cbiAgXy5vbmNlID0gZnVuY3Rpb24oZnVuYykge1xuICAgIHZhciByYW4gPSBmYWxzZSwgbWVtbztcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAocmFuKSByZXR1cm4gbWVtbztcbiAgICAgIHJhbiA9IHRydWU7XG4gICAgICBtZW1vID0gZnVuYy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgZnVuYyA9IG51bGw7XG4gICAgICByZXR1cm4gbWVtbztcbiAgICB9O1xuICB9O1xuXG4gIC8vIFJldHVybnMgdGhlIGZpcnN0IGZ1bmN0aW9uIHBhc3NlZCBhcyBhbiBhcmd1bWVudCB0byB0aGUgc2Vjb25kLFxuICAvLyBhbGxvd2luZyB5b3UgdG8gYWRqdXN0IGFyZ3VtZW50cywgcnVuIGNvZGUgYmVmb3JlIGFuZCBhZnRlciwgYW5kXG4gIC8vIGNvbmRpdGlvbmFsbHkgZXhlY3V0ZSB0aGUgb3JpZ2luYWwgZnVuY3Rpb24uXG4gIF8ud3JhcCA9IGZ1bmN0aW9uKGZ1bmMsIHdyYXBwZXIpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgYXJncyA9IFtmdW5jXTtcbiAgICAgIHB1c2guYXBwbHkoYXJncywgYXJndW1lbnRzKTtcbiAgICAgIHJldHVybiB3cmFwcGVyLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgIH07XG4gIH07XG5cbiAgLy8gUmV0dXJucyBhIGZ1bmN0aW9uIHRoYXQgaXMgdGhlIGNvbXBvc2l0aW9uIG9mIGEgbGlzdCBvZiBmdW5jdGlvbnMsIGVhY2hcbiAgLy8gY29uc3VtaW5nIHRoZSByZXR1cm4gdmFsdWUgb2YgdGhlIGZ1bmN0aW9uIHRoYXQgZm9sbG93cy5cbiAgXy5jb21wb3NlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGZ1bmNzID0gYXJndW1lbnRzO1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgZm9yICh2YXIgaSA9IGZ1bmNzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgIGFyZ3MgPSBbZnVuY3NbaV0uYXBwbHkodGhpcywgYXJncyldO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGFyZ3NbMF07XG4gICAgfTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGEgZnVuY3Rpb24gdGhhdCB3aWxsIG9ubHkgYmUgZXhlY3V0ZWQgYWZ0ZXIgYmVpbmcgY2FsbGVkIE4gdGltZXMuXG4gIF8uYWZ0ZXIgPSBmdW5jdGlvbih0aW1lcywgZnVuYykge1xuICAgIGlmICh0aW1lcyA8PSAwKSByZXR1cm4gZnVuYygpO1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICgtLXRpbWVzIDwgMSkge1xuICAgICAgICByZXR1cm4gZnVuYy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgfVxuICAgIH07XG4gIH07XG5cbiAgLy8gT2JqZWN0IEZ1bmN0aW9uc1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gUmV0cmlldmUgdGhlIG5hbWVzIG9mIGFuIG9iamVjdCdzIHByb3BlcnRpZXMuXG4gIC8vIERlbGVnYXRlcyB0byAqKkVDTUFTY3JpcHQgNSoqJ3MgbmF0aXZlIGBPYmplY3Qua2V5c2BcbiAgXy5rZXlzID0gbmF0aXZlS2V5cyB8fCBmdW5jdGlvbihvYmopIHtcbiAgICBpZiAob2JqICE9PSBPYmplY3Qob2JqKSkgdGhyb3cgbmV3IFR5cGVFcnJvcignSW52YWxpZCBvYmplY3QnKTtcbiAgICB2YXIga2V5cyA9IFtdO1xuICAgIGZvciAodmFyIGtleSBpbiBvYmopIGlmIChfLmhhcyhvYmosIGtleSkpIGtleXNba2V5cy5sZW5ndGhdID0ga2V5O1xuICAgIHJldHVybiBrZXlzO1xuICB9O1xuXG4gIC8vIFJldHJpZXZlIHRoZSB2YWx1ZXMgb2YgYW4gb2JqZWN0J3MgcHJvcGVydGllcy5cbiAgXy52YWx1ZXMgPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIgdmFsdWVzID0gW107XG4gICAgZm9yICh2YXIga2V5IGluIG9iaikgaWYgKF8uaGFzKG9iaiwga2V5KSkgdmFsdWVzLnB1c2gob2JqW2tleV0pO1xuICAgIHJldHVybiB2YWx1ZXM7XG4gIH07XG5cbiAgLy8gQ29udmVydCBhbiBvYmplY3QgaW50byBhIGxpc3Qgb2YgYFtrZXksIHZhbHVlXWAgcGFpcnMuXG4gIF8ucGFpcnMgPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIgcGFpcnMgPSBbXTtcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSBpZiAoXy5oYXMob2JqLCBrZXkpKSBwYWlycy5wdXNoKFtrZXksIG9ialtrZXldXSk7XG4gICAgcmV0dXJuIHBhaXJzO1xuICB9O1xuXG4gIC8vIEludmVydCB0aGUga2V5cyBhbmQgdmFsdWVzIG9mIGFuIG9iamVjdC4gVGhlIHZhbHVlcyBtdXN0IGJlIHNlcmlhbGl6YWJsZS5cbiAgXy5pbnZlcnQgPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIgcmVzdWx0ID0ge307XG4gICAgZm9yICh2YXIga2V5IGluIG9iaikgaWYgKF8uaGFzKG9iaiwga2V5KSkgcmVzdWx0W29ialtrZXldXSA9IGtleTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIC8vIFJldHVybiBhIHNvcnRlZCBsaXN0IG9mIHRoZSBmdW5jdGlvbiBuYW1lcyBhdmFpbGFibGUgb24gdGhlIG9iamVjdC5cbiAgLy8gQWxpYXNlZCBhcyBgbWV0aG9kc2BcbiAgXy5mdW5jdGlvbnMgPSBfLm1ldGhvZHMgPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIgbmFtZXMgPSBbXTtcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgICBpZiAoXy5pc0Z1bmN0aW9uKG9ialtrZXldKSkgbmFtZXMucHVzaChrZXkpO1xuICAgIH1cbiAgICByZXR1cm4gbmFtZXMuc29ydCgpO1xuICB9O1xuXG4gIC8vIEV4dGVuZCBhIGdpdmVuIG9iamVjdCB3aXRoIGFsbCB0aGUgcHJvcGVydGllcyBpbiBwYXNzZWQtaW4gb2JqZWN0KHMpLlxuICBfLmV4dGVuZCA9IGZ1bmN0aW9uKG9iaikge1xuICAgIGVhY2goc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpLCBmdW5jdGlvbihzb3VyY2UpIHtcbiAgICAgIGlmIChzb3VyY2UpIHtcbiAgICAgICAgZm9yICh2YXIgcHJvcCBpbiBzb3VyY2UpIHtcbiAgICAgICAgICBvYmpbcHJvcF0gPSBzb3VyY2VbcHJvcF07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gb2JqO1xuICB9O1xuXG4gIC8vIFJldHVybiBhIGNvcHkgb2YgdGhlIG9iamVjdCBvbmx5IGNvbnRhaW5pbmcgdGhlIHdoaXRlbGlzdGVkIHByb3BlcnRpZXMuXG4gIF8ucGljayA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciBjb3B5ID0ge307XG4gICAgdmFyIGtleXMgPSBjb25jYXQuYXBwbHkoQXJyYXlQcm90bywgc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpKTtcbiAgICBlYWNoKGtleXMsIGZ1bmN0aW9uKGtleSkge1xuICAgICAgaWYgKGtleSBpbiBvYmopIGNvcHlba2V5XSA9IG9ialtrZXldO1xuICAgIH0pO1xuICAgIHJldHVybiBjb3B5O1xuICB9O1xuXG4gICAvLyBSZXR1cm4gYSBjb3B5IG9mIHRoZSBvYmplY3Qgd2l0aG91dCB0aGUgYmxhY2tsaXN0ZWQgcHJvcGVydGllcy5cbiAgXy5vbWl0ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIGNvcHkgPSB7fTtcbiAgICB2YXIga2V5cyA9IGNvbmNhdC5hcHBseShBcnJheVByb3RvLCBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSkpO1xuICAgIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICAgIGlmICghXy5jb250YWlucyhrZXlzLCBrZXkpKSBjb3B5W2tleV0gPSBvYmpba2V5XTtcbiAgICB9XG4gICAgcmV0dXJuIGNvcHk7XG4gIH07XG5cbiAgLy8gRmlsbCBpbiBhIGdpdmVuIG9iamVjdCB3aXRoIGRlZmF1bHQgcHJvcGVydGllcy5cbiAgXy5kZWZhdWx0cyA9IGZ1bmN0aW9uKG9iaikge1xuICAgIGVhY2goc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpLCBmdW5jdGlvbihzb3VyY2UpIHtcbiAgICAgIGlmIChzb3VyY2UpIHtcbiAgICAgICAgZm9yICh2YXIgcHJvcCBpbiBzb3VyY2UpIHtcbiAgICAgICAgICBpZiAob2JqW3Byb3BdID09IG51bGwpIG9ialtwcm9wXSA9IHNvdXJjZVtwcm9wXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBvYmo7XG4gIH07XG5cbiAgLy8gQ3JlYXRlIGEgKHNoYWxsb3ctY2xvbmVkKSBkdXBsaWNhdGUgb2YgYW4gb2JqZWN0LlxuICBfLmNsb25lID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKCFfLmlzT2JqZWN0KG9iaikpIHJldHVybiBvYmo7XG4gICAgcmV0dXJuIF8uaXNBcnJheShvYmopID8gb2JqLnNsaWNlKCkgOiBfLmV4dGVuZCh7fSwgb2JqKTtcbiAgfTtcblxuICAvLyBJbnZva2VzIGludGVyY2VwdG9yIHdpdGggdGhlIG9iaiwgYW5kIHRoZW4gcmV0dXJucyBvYmouXG4gIC8vIFRoZSBwcmltYXJ5IHB1cnBvc2Ugb2YgdGhpcyBtZXRob2QgaXMgdG8gXCJ0YXAgaW50b1wiIGEgbWV0aG9kIGNoYWluLCBpblxuICAvLyBvcmRlciB0byBwZXJmb3JtIG9wZXJhdGlvbnMgb24gaW50ZXJtZWRpYXRlIHJlc3VsdHMgd2l0aGluIHRoZSBjaGFpbi5cbiAgXy50YXAgPSBmdW5jdGlvbihvYmosIGludGVyY2VwdG9yKSB7XG4gICAgaW50ZXJjZXB0b3Iob2JqKTtcbiAgICByZXR1cm4gb2JqO1xuICB9O1xuXG4gIC8vIEludGVybmFsIHJlY3Vyc2l2ZSBjb21wYXJpc29uIGZ1bmN0aW9uIGZvciBgaXNFcXVhbGAuXG4gIHZhciBlcSA9IGZ1bmN0aW9uKGEsIGIsIGFTdGFjaywgYlN0YWNrKSB7XG4gICAgLy8gSWRlbnRpY2FsIG9iamVjdHMgYXJlIGVxdWFsLiBgMCA9PT0gLTBgLCBidXQgdGhleSBhcmVuJ3QgaWRlbnRpY2FsLlxuICAgIC8vIFNlZSB0aGUgSGFybW9ueSBgZWdhbGAgcHJvcG9zYWw6IGh0dHA6Ly93aWtpLmVjbWFzY3JpcHQub3JnL2Rva3UucGhwP2lkPWhhcm1vbnk6ZWdhbC5cbiAgICBpZiAoYSA9PT0gYikgcmV0dXJuIGEgIT09IDAgfHwgMSAvIGEgPT0gMSAvIGI7XG4gICAgLy8gQSBzdHJpY3QgY29tcGFyaXNvbiBpcyBuZWNlc3NhcnkgYmVjYXVzZSBgbnVsbCA9PSB1bmRlZmluZWRgLlxuICAgIGlmIChhID09IG51bGwgfHwgYiA9PSBudWxsKSByZXR1cm4gYSA9PT0gYjtcbiAgICAvLyBVbndyYXAgYW55IHdyYXBwZWQgb2JqZWN0cy5cbiAgICBpZiAoYSBpbnN0YW5jZW9mIF8pIGEgPSBhLl93cmFwcGVkO1xuICAgIGlmIChiIGluc3RhbmNlb2YgXykgYiA9IGIuX3dyYXBwZWQ7XG4gICAgLy8gQ29tcGFyZSBgW1tDbGFzc11dYCBuYW1lcy5cbiAgICB2YXIgY2xhc3NOYW1lID0gdG9TdHJpbmcuY2FsbChhKTtcbiAgICBpZiAoY2xhc3NOYW1lICE9IHRvU3RyaW5nLmNhbGwoYikpIHJldHVybiBmYWxzZTtcbiAgICBzd2l0Y2ggKGNsYXNzTmFtZSkge1xuICAgICAgLy8gU3RyaW5ncywgbnVtYmVycywgZGF0ZXMsIGFuZCBib29sZWFucyBhcmUgY29tcGFyZWQgYnkgdmFsdWUuXG4gICAgICBjYXNlICdbb2JqZWN0IFN0cmluZ10nOlxuICAgICAgICAvLyBQcmltaXRpdmVzIGFuZCB0aGVpciBjb3JyZXNwb25kaW5nIG9iamVjdCB3cmFwcGVycyBhcmUgZXF1aXZhbGVudDsgdGh1cywgYFwiNVwiYCBpc1xuICAgICAgICAvLyBlcXVpdmFsZW50IHRvIGBuZXcgU3RyaW5nKFwiNVwiKWAuXG4gICAgICAgIHJldHVybiBhID09IFN0cmluZyhiKTtcbiAgICAgIGNhc2UgJ1tvYmplY3QgTnVtYmVyXSc6XG4gICAgICAgIC8vIGBOYU5gcyBhcmUgZXF1aXZhbGVudCwgYnV0IG5vbi1yZWZsZXhpdmUuIEFuIGBlZ2FsYCBjb21wYXJpc29uIGlzIHBlcmZvcm1lZCBmb3JcbiAgICAgICAgLy8gb3RoZXIgbnVtZXJpYyB2YWx1ZXMuXG4gICAgICAgIHJldHVybiBhICE9ICthID8gYiAhPSArYiA6IChhID09IDAgPyAxIC8gYSA9PSAxIC8gYiA6IGEgPT0gK2IpO1xuICAgICAgY2FzZSAnW29iamVjdCBEYXRlXSc6XG4gICAgICBjYXNlICdbb2JqZWN0IEJvb2xlYW5dJzpcbiAgICAgICAgLy8gQ29lcmNlIGRhdGVzIGFuZCBib29sZWFucyB0byBudW1lcmljIHByaW1pdGl2ZSB2YWx1ZXMuIERhdGVzIGFyZSBjb21wYXJlZCBieSB0aGVpclxuICAgICAgICAvLyBtaWxsaXNlY29uZCByZXByZXNlbnRhdGlvbnMuIE5vdGUgdGhhdCBpbnZhbGlkIGRhdGVzIHdpdGggbWlsbGlzZWNvbmQgcmVwcmVzZW50YXRpb25zXG4gICAgICAgIC8vIG9mIGBOYU5gIGFyZSBub3QgZXF1aXZhbGVudC5cbiAgICAgICAgcmV0dXJuICthID09ICtiO1xuICAgICAgLy8gUmVnRXhwcyBhcmUgY29tcGFyZWQgYnkgdGhlaXIgc291cmNlIHBhdHRlcm5zIGFuZCBmbGFncy5cbiAgICAgIGNhc2UgJ1tvYmplY3QgUmVnRXhwXSc6XG4gICAgICAgIHJldHVybiBhLnNvdXJjZSA9PSBiLnNvdXJjZSAmJlxuICAgICAgICAgICAgICAgYS5nbG9iYWwgPT0gYi5nbG9iYWwgJiZcbiAgICAgICAgICAgICAgIGEubXVsdGlsaW5lID09IGIubXVsdGlsaW5lICYmXG4gICAgICAgICAgICAgICBhLmlnbm9yZUNhc2UgPT0gYi5pZ25vcmVDYXNlO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIGEgIT0gJ29iamVjdCcgfHwgdHlwZW9mIGIgIT0gJ29iamVjdCcpIHJldHVybiBmYWxzZTtcbiAgICAvLyBBc3N1bWUgZXF1YWxpdHkgZm9yIGN5Y2xpYyBzdHJ1Y3R1cmVzLiBUaGUgYWxnb3JpdGhtIGZvciBkZXRlY3RpbmcgY3ljbGljXG4gICAgLy8gc3RydWN0dXJlcyBpcyBhZGFwdGVkIGZyb20gRVMgNS4xIHNlY3Rpb24gMTUuMTIuMywgYWJzdHJhY3Qgb3BlcmF0aW9uIGBKT2AuXG4gICAgdmFyIGxlbmd0aCA9IGFTdGFjay5sZW5ndGg7XG4gICAgd2hpbGUgKGxlbmd0aC0tKSB7XG4gICAgICAvLyBMaW5lYXIgc2VhcmNoLiBQZXJmb3JtYW5jZSBpcyBpbnZlcnNlbHkgcHJvcG9ydGlvbmFsIHRvIHRoZSBudW1iZXIgb2ZcbiAgICAgIC8vIHVuaXF1ZSBuZXN0ZWQgc3RydWN0dXJlcy5cbiAgICAgIGlmIChhU3RhY2tbbGVuZ3RoXSA9PSBhKSByZXR1cm4gYlN0YWNrW2xlbmd0aF0gPT0gYjtcbiAgICB9XG4gICAgLy8gQWRkIHRoZSBmaXJzdCBvYmplY3QgdG8gdGhlIHN0YWNrIG9mIHRyYXZlcnNlZCBvYmplY3RzLlxuICAgIGFTdGFjay5wdXNoKGEpO1xuICAgIGJTdGFjay5wdXNoKGIpO1xuICAgIHZhciBzaXplID0gMCwgcmVzdWx0ID0gdHJ1ZTtcbiAgICAvLyBSZWN1cnNpdmVseSBjb21wYXJlIG9iamVjdHMgYW5kIGFycmF5cy5cbiAgICBpZiAoY2xhc3NOYW1lID09ICdbb2JqZWN0IEFycmF5XScpIHtcbiAgICAgIC8vIENvbXBhcmUgYXJyYXkgbGVuZ3RocyB0byBkZXRlcm1pbmUgaWYgYSBkZWVwIGNvbXBhcmlzb24gaXMgbmVjZXNzYXJ5LlxuICAgICAgc2l6ZSA9IGEubGVuZ3RoO1xuICAgICAgcmVzdWx0ID0gc2l6ZSA9PSBiLmxlbmd0aDtcbiAgICAgIGlmIChyZXN1bHQpIHtcbiAgICAgICAgLy8gRGVlcCBjb21wYXJlIHRoZSBjb250ZW50cywgaWdub3Jpbmcgbm9uLW51bWVyaWMgcHJvcGVydGllcy5cbiAgICAgICAgd2hpbGUgKHNpemUtLSkge1xuICAgICAgICAgIGlmICghKHJlc3VsdCA9IGVxKGFbc2l6ZV0sIGJbc2l6ZV0sIGFTdGFjaywgYlN0YWNrKSkpIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIE9iamVjdHMgd2l0aCBkaWZmZXJlbnQgY29uc3RydWN0b3JzIGFyZSBub3QgZXF1aXZhbGVudCwgYnV0IGBPYmplY3Rgc1xuICAgICAgLy8gZnJvbSBkaWZmZXJlbnQgZnJhbWVzIGFyZS5cbiAgICAgIHZhciBhQ3RvciA9IGEuY29uc3RydWN0b3IsIGJDdG9yID0gYi5jb25zdHJ1Y3RvcjtcbiAgICAgIGlmIChhQ3RvciAhPT0gYkN0b3IgJiYgIShfLmlzRnVuY3Rpb24oYUN0b3IpICYmIChhQ3RvciBpbnN0YW5jZW9mIGFDdG9yKSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8uaXNGdW5jdGlvbihiQ3RvcikgJiYgKGJDdG9yIGluc3RhbmNlb2YgYkN0b3IpKSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICAvLyBEZWVwIGNvbXBhcmUgb2JqZWN0cy5cbiAgICAgIGZvciAodmFyIGtleSBpbiBhKSB7XG4gICAgICAgIGlmIChfLmhhcyhhLCBrZXkpKSB7XG4gICAgICAgICAgLy8gQ291bnQgdGhlIGV4cGVjdGVkIG51bWJlciBvZiBwcm9wZXJ0aWVzLlxuICAgICAgICAgIHNpemUrKztcbiAgICAgICAgICAvLyBEZWVwIGNvbXBhcmUgZWFjaCBtZW1iZXIuXG4gICAgICAgICAgaWYgKCEocmVzdWx0ID0gXy5oYXMoYiwga2V5KSAmJiBlcShhW2tleV0sIGJba2V5XSwgYVN0YWNrLCBiU3RhY2spKSkgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vIEVuc3VyZSB0aGF0IGJvdGggb2JqZWN0cyBjb250YWluIHRoZSBzYW1lIG51bWJlciBvZiBwcm9wZXJ0aWVzLlxuICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICBmb3IgKGtleSBpbiBiKSB7XG4gICAgICAgICAgaWYgKF8uaGFzKGIsIGtleSkgJiYgIShzaXplLS0pKSBicmVhaztcbiAgICAgICAgfVxuICAgICAgICByZXN1bHQgPSAhc2l6ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gUmVtb3ZlIHRoZSBmaXJzdCBvYmplY3QgZnJvbSB0aGUgc3RhY2sgb2YgdHJhdmVyc2VkIG9iamVjdHMuXG4gICAgYVN0YWNrLnBvcCgpO1xuICAgIGJTdGFjay5wb3AoKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIC8vIFBlcmZvcm0gYSBkZWVwIGNvbXBhcmlzb24gdG8gY2hlY2sgaWYgdHdvIG9iamVjdHMgYXJlIGVxdWFsLlxuICBfLmlzRXF1YWwgPSBmdW5jdGlvbihhLCBiKSB7XG4gICAgcmV0dXJuIGVxKGEsIGIsIFtdLCBbXSk7XG4gIH07XG5cbiAgLy8gSXMgYSBnaXZlbiBhcnJheSwgc3RyaW5nLCBvciBvYmplY3QgZW1wdHk/XG4gIC8vIEFuIFwiZW1wdHlcIiBvYmplY3QgaGFzIG5vIGVudW1lcmFibGUgb3duLXByb3BlcnRpZXMuXG4gIF8uaXNFbXB0eSA9IGZ1bmN0aW9uKG9iaikge1xuICAgIGlmIChvYmogPT0gbnVsbCkgcmV0dXJuIHRydWU7XG4gICAgaWYgKF8uaXNBcnJheShvYmopIHx8IF8uaXNTdHJpbmcob2JqKSkgcmV0dXJuIG9iai5sZW5ndGggPT09IDA7XG4gICAgZm9yICh2YXIga2V5IGluIG9iaikgaWYgKF8uaGFzKG9iaiwga2V5KSkgcmV0dXJuIGZhbHNlO1xuICAgIHJldHVybiB0cnVlO1xuICB9O1xuXG4gIC8vIElzIGEgZ2l2ZW4gdmFsdWUgYSBET00gZWxlbWVudD9cbiAgXy5pc0VsZW1lbnQgPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gISEob2JqICYmIG9iai5ub2RlVHlwZSA9PT0gMSk7XG4gIH07XG5cbiAgLy8gSXMgYSBnaXZlbiB2YWx1ZSBhbiBhcnJheT9cbiAgLy8gRGVsZWdhdGVzIHRvIEVDTUE1J3MgbmF0aXZlIEFycmF5LmlzQXJyYXlcbiAgXy5pc0FycmF5ID0gbmF0aXZlSXNBcnJheSB8fCBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gdG9TdHJpbmcuY2FsbChvYmopID09ICdbb2JqZWN0IEFycmF5XSc7XG4gIH07XG5cbiAgLy8gSXMgYSBnaXZlbiB2YXJpYWJsZSBhbiBvYmplY3Q/XG4gIF8uaXNPYmplY3QgPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gb2JqID09PSBPYmplY3Qob2JqKTtcbiAgfTtcblxuICAvLyBBZGQgc29tZSBpc1R5cGUgbWV0aG9kczogaXNBcmd1bWVudHMsIGlzRnVuY3Rpb24sIGlzU3RyaW5nLCBpc051bWJlciwgaXNEYXRlLCBpc1JlZ0V4cC5cbiAgZWFjaChbJ0FyZ3VtZW50cycsICdGdW5jdGlvbicsICdTdHJpbmcnLCAnTnVtYmVyJywgJ0RhdGUnLCAnUmVnRXhwJ10sIGZ1bmN0aW9uKG5hbWUpIHtcbiAgICBfWydpcycgKyBuYW1lXSA9IGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuIHRvU3RyaW5nLmNhbGwob2JqKSA9PSAnW29iamVjdCAnICsgbmFtZSArICddJztcbiAgICB9O1xuICB9KTtcblxuICAvLyBEZWZpbmUgYSBmYWxsYmFjayB2ZXJzaW9uIG9mIHRoZSBtZXRob2QgaW4gYnJvd3NlcnMgKGFoZW0sIElFKSwgd2hlcmVcbiAgLy8gdGhlcmUgaXNuJ3QgYW55IGluc3BlY3RhYmxlIFwiQXJndW1lbnRzXCIgdHlwZS5cbiAgaWYgKCFfLmlzQXJndW1lbnRzKGFyZ3VtZW50cykpIHtcbiAgICBfLmlzQXJndW1lbnRzID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXR1cm4gISEob2JqICYmIF8uaGFzKG9iaiwgJ2NhbGxlZScpKTtcbiAgICB9O1xuICB9XG5cbiAgLy8gT3B0aW1pemUgYGlzRnVuY3Rpb25gIGlmIGFwcHJvcHJpYXRlLlxuICBpZiAodHlwZW9mICgvLi8pICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgXy5pc0Z1bmN0aW9uID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXR1cm4gdHlwZW9mIG9iaiA9PT0gJ2Z1bmN0aW9uJztcbiAgICB9O1xuICB9XG5cbiAgLy8gSXMgYSBnaXZlbiBvYmplY3QgYSBmaW5pdGUgbnVtYmVyP1xuICBfLmlzRmluaXRlID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIGlzRmluaXRlKG9iaikgJiYgIWlzTmFOKHBhcnNlRmxvYXQob2JqKSk7XG4gIH07XG5cbiAgLy8gSXMgdGhlIGdpdmVuIHZhbHVlIGBOYU5gPyAoTmFOIGlzIHRoZSBvbmx5IG51bWJlciB3aGljaCBkb2VzIG5vdCBlcXVhbCBpdHNlbGYpLlxuICBfLmlzTmFOID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIF8uaXNOdW1iZXIob2JqKSAmJiBvYmogIT0gK29iajtcbiAgfTtcblxuICAvLyBJcyBhIGdpdmVuIHZhbHVlIGEgYm9vbGVhbj9cbiAgXy5pc0Jvb2xlYW4gPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gb2JqID09PSB0cnVlIHx8IG9iaiA9PT0gZmFsc2UgfHwgdG9TdHJpbmcuY2FsbChvYmopID09ICdbb2JqZWN0IEJvb2xlYW5dJztcbiAgfTtcblxuICAvLyBJcyBhIGdpdmVuIHZhbHVlIGVxdWFsIHRvIG51bGw/XG4gIF8uaXNOdWxsID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIG9iaiA9PT0gbnVsbDtcbiAgfTtcblxuICAvLyBJcyBhIGdpdmVuIHZhcmlhYmxlIHVuZGVmaW5lZD9cbiAgXy5pc1VuZGVmaW5lZCA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiBvYmogPT09IHZvaWQgMDtcbiAgfTtcblxuICAvLyBTaG9ydGN1dCBmdW5jdGlvbiBmb3IgY2hlY2tpbmcgaWYgYW4gb2JqZWN0IGhhcyBhIGdpdmVuIHByb3BlcnR5IGRpcmVjdGx5XG4gIC8vIG9uIGl0c2VsZiAoaW4gb3RoZXIgd29yZHMsIG5vdCBvbiBhIHByb3RvdHlwZSkuXG4gIF8uaGFzID0gZnVuY3Rpb24ob2JqLCBrZXkpIHtcbiAgICByZXR1cm4gaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGtleSk7XG4gIH07XG5cbiAgLy8gVXRpbGl0eSBGdW5jdGlvbnNcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvLyBSdW4gVW5kZXJzY29yZS5qcyBpbiAqbm9Db25mbGljdCogbW9kZSwgcmV0dXJuaW5nIHRoZSBgX2AgdmFyaWFibGUgdG8gaXRzXG4gIC8vIHByZXZpb3VzIG93bmVyLiBSZXR1cm5zIGEgcmVmZXJlbmNlIHRvIHRoZSBVbmRlcnNjb3JlIG9iamVjdC5cbiAgXy5ub0NvbmZsaWN0ID0gZnVuY3Rpb24oKSB7XG4gICAgcm9vdC5fID0gcHJldmlvdXNVbmRlcnNjb3JlO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8vIEtlZXAgdGhlIGlkZW50aXR5IGZ1bmN0aW9uIGFyb3VuZCBmb3IgZGVmYXVsdCBpdGVyYXRvcnMuXG4gIF8uaWRlbnRpdHkgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfTtcblxuICAvLyBSdW4gYSBmdW5jdGlvbiAqKm4qKiB0aW1lcy5cbiAgXy50aW1lcyA9IGZ1bmN0aW9uKG4sIGl0ZXJhdG9yLCBjb250ZXh0KSB7XG4gICAgdmFyIGFjY3VtID0gQXJyYXkobik7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBuOyBpKyspIGFjY3VtW2ldID0gaXRlcmF0b3IuY2FsbChjb250ZXh0LCBpKTtcbiAgICByZXR1cm4gYWNjdW07XG4gIH07XG5cbiAgLy8gUmV0dXJuIGEgcmFuZG9tIGludGVnZXIgYmV0d2VlbiBtaW4gYW5kIG1heCAoaW5jbHVzaXZlKS5cbiAgXy5yYW5kb20gPSBmdW5jdGlvbihtaW4sIG1heCkge1xuICAgIGlmIChtYXggPT0gbnVsbCkge1xuICAgICAgbWF4ID0gbWluO1xuICAgICAgbWluID0gMDtcbiAgICB9XG4gICAgcmV0dXJuIG1pbiArIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4gKyAxKSk7XG4gIH07XG5cbiAgLy8gTGlzdCBvZiBIVE1MIGVudGl0aWVzIGZvciBlc2NhcGluZy5cbiAgdmFyIGVudGl0eU1hcCA9IHtcbiAgICBlc2NhcGU6IHtcbiAgICAgICcmJzogJyZhbXA7JyxcbiAgICAgICc8JzogJyZsdDsnLFxuICAgICAgJz4nOiAnJmd0OycsXG4gICAgICAnXCInOiAnJnF1b3Q7JyxcbiAgICAgIFwiJ1wiOiAnJiN4Mjc7JyxcbiAgICAgICcvJzogJyYjeDJGOydcbiAgICB9XG4gIH07XG4gIGVudGl0eU1hcC51bmVzY2FwZSA9IF8uaW52ZXJ0KGVudGl0eU1hcC5lc2NhcGUpO1xuXG4gIC8vIFJlZ2V4ZXMgY29udGFpbmluZyB0aGUga2V5cyBhbmQgdmFsdWVzIGxpc3RlZCBpbW1lZGlhdGVseSBhYm92ZS5cbiAgdmFyIGVudGl0eVJlZ2V4ZXMgPSB7XG4gICAgZXNjYXBlOiAgIG5ldyBSZWdFeHAoJ1snICsgXy5rZXlzKGVudGl0eU1hcC5lc2NhcGUpLmpvaW4oJycpICsgJ10nLCAnZycpLFxuICAgIHVuZXNjYXBlOiBuZXcgUmVnRXhwKCcoJyArIF8ua2V5cyhlbnRpdHlNYXAudW5lc2NhcGUpLmpvaW4oJ3wnKSArICcpJywgJ2cnKVxuICB9O1xuXG4gIC8vIEZ1bmN0aW9ucyBmb3IgZXNjYXBpbmcgYW5kIHVuZXNjYXBpbmcgc3RyaW5ncyB0by9mcm9tIEhUTUwgaW50ZXJwb2xhdGlvbi5cbiAgXy5lYWNoKFsnZXNjYXBlJywgJ3VuZXNjYXBlJ10sIGZ1bmN0aW9uKG1ldGhvZCkge1xuICAgIF9bbWV0aG9kXSA9IGZ1bmN0aW9uKHN0cmluZykge1xuICAgICAgaWYgKHN0cmluZyA9PSBudWxsKSByZXR1cm4gJyc7XG4gICAgICByZXR1cm4gKCcnICsgc3RyaW5nKS5yZXBsYWNlKGVudGl0eVJlZ2V4ZXNbbWV0aG9kXSwgZnVuY3Rpb24obWF0Y2gpIHtcbiAgICAgICAgcmV0dXJuIGVudGl0eU1hcFttZXRob2RdW21hdGNoXTtcbiAgICAgIH0pO1xuICAgIH07XG4gIH0pO1xuXG4gIC8vIElmIHRoZSB2YWx1ZSBvZiB0aGUgbmFtZWQgcHJvcGVydHkgaXMgYSBmdW5jdGlvbiB0aGVuIGludm9rZSBpdDtcbiAgLy8gb3RoZXJ3aXNlLCByZXR1cm4gaXQuXG4gIF8ucmVzdWx0ID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkge1xuICAgIGlmIChvYmplY3QgPT0gbnVsbCkgcmV0dXJuIG51bGw7XG4gICAgdmFyIHZhbHVlID0gb2JqZWN0W3Byb3BlcnR5XTtcbiAgICByZXR1cm4gXy5pc0Z1bmN0aW9uKHZhbHVlKSA/IHZhbHVlLmNhbGwob2JqZWN0KSA6IHZhbHVlO1xuICB9O1xuXG4gIC8vIEFkZCB5b3VyIG93biBjdXN0b20gZnVuY3Rpb25zIHRvIHRoZSBVbmRlcnNjb3JlIG9iamVjdC5cbiAgXy5taXhpbiA9IGZ1bmN0aW9uKG9iaikge1xuICAgIGVhY2goXy5mdW5jdGlvbnMob2JqKSwgZnVuY3Rpb24obmFtZSl7XG4gICAgICB2YXIgZnVuYyA9IF9bbmFtZV0gPSBvYmpbbmFtZV07XG4gICAgICBfLnByb3RvdHlwZVtuYW1lXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgYXJncyA9IFt0aGlzLl93cmFwcGVkXTtcbiAgICAgICAgcHVzaC5hcHBseShhcmdzLCBhcmd1bWVudHMpO1xuICAgICAgICByZXR1cm4gcmVzdWx0LmNhbGwodGhpcywgZnVuYy5hcHBseShfLCBhcmdzKSk7XG4gICAgICB9O1xuICAgIH0pO1xuICB9O1xuXG4gIC8vIEdlbmVyYXRlIGEgdW5pcXVlIGludGVnZXIgaWQgKHVuaXF1ZSB3aXRoaW4gdGhlIGVudGlyZSBjbGllbnQgc2Vzc2lvbikuXG4gIC8vIFVzZWZ1bCBmb3IgdGVtcG9yYXJ5IERPTSBpZHMuXG4gIHZhciBpZENvdW50ZXIgPSAwO1xuICBfLnVuaXF1ZUlkID0gZnVuY3Rpb24ocHJlZml4KSB7XG4gICAgdmFyIGlkID0gKytpZENvdW50ZXIgKyAnJztcbiAgICByZXR1cm4gcHJlZml4ID8gcHJlZml4ICsgaWQgOiBpZDtcbiAgfTtcblxuICAvLyBCeSBkZWZhdWx0LCBVbmRlcnNjb3JlIHVzZXMgRVJCLXN0eWxlIHRlbXBsYXRlIGRlbGltaXRlcnMsIGNoYW5nZSB0aGVcbiAgLy8gZm9sbG93aW5nIHRlbXBsYXRlIHNldHRpbmdzIHRvIHVzZSBhbHRlcm5hdGl2ZSBkZWxpbWl0ZXJzLlxuICBfLnRlbXBsYXRlU2V0dGluZ3MgPSB7XG4gICAgZXZhbHVhdGUgICAgOiAvPCUoW1xcc1xcU10rPyklPi9nLFxuICAgIGludGVycG9sYXRlIDogLzwlPShbXFxzXFxTXSs/KSU+L2csXG4gICAgZXNjYXBlICAgICAgOiAvPCUtKFtcXHNcXFNdKz8pJT4vZ1xuICB9O1xuXG4gIC8vIFdoZW4gY3VzdG9taXppbmcgYHRlbXBsYXRlU2V0dGluZ3NgLCBpZiB5b3UgZG9uJ3Qgd2FudCB0byBkZWZpbmUgYW5cbiAgLy8gaW50ZXJwb2xhdGlvbiwgZXZhbHVhdGlvbiBvciBlc2NhcGluZyByZWdleCwgd2UgbmVlZCBvbmUgdGhhdCBpc1xuICAvLyBndWFyYW50ZWVkIG5vdCB0byBtYXRjaC5cbiAgdmFyIG5vTWF0Y2ggPSAvKC4pXi87XG5cbiAgLy8gQ2VydGFpbiBjaGFyYWN0ZXJzIG5lZWQgdG8gYmUgZXNjYXBlZCBzbyB0aGF0IHRoZXkgY2FuIGJlIHB1dCBpbnRvIGFcbiAgLy8gc3RyaW5nIGxpdGVyYWwuXG4gIHZhciBlc2NhcGVzID0ge1xuICAgIFwiJ1wiOiAgICAgIFwiJ1wiLFxuICAgICdcXFxcJzogICAgICdcXFxcJyxcbiAgICAnXFxyJzogICAgICdyJyxcbiAgICAnXFxuJzogICAgICduJyxcbiAgICAnXFx0JzogICAgICd0JyxcbiAgICAnXFx1MjAyOCc6ICd1MjAyOCcsXG4gICAgJ1xcdTIwMjknOiAndTIwMjknXG4gIH07XG5cbiAgdmFyIGVzY2FwZXIgPSAvXFxcXHwnfFxccnxcXG58XFx0fFxcdTIwMjh8XFx1MjAyOS9nO1xuXG4gIC8vIEphdmFTY3JpcHQgbWljcm8tdGVtcGxhdGluZywgc2ltaWxhciB0byBKb2huIFJlc2lnJ3MgaW1wbGVtZW50YXRpb24uXG4gIC8vIFVuZGVyc2NvcmUgdGVtcGxhdGluZyBoYW5kbGVzIGFyYml0cmFyeSBkZWxpbWl0ZXJzLCBwcmVzZXJ2ZXMgd2hpdGVzcGFjZSxcbiAgLy8gYW5kIGNvcnJlY3RseSBlc2NhcGVzIHF1b3RlcyB3aXRoaW4gaW50ZXJwb2xhdGVkIGNvZGUuXG4gIF8udGVtcGxhdGUgPSBmdW5jdGlvbih0ZXh0LCBkYXRhLCBzZXR0aW5ncykge1xuICAgIHZhciByZW5kZXI7XG4gICAgc2V0dGluZ3MgPSBfLmRlZmF1bHRzKHt9LCBzZXR0aW5ncywgXy50ZW1wbGF0ZVNldHRpbmdzKTtcblxuICAgIC8vIENvbWJpbmUgZGVsaW1pdGVycyBpbnRvIG9uZSByZWd1bGFyIGV4cHJlc3Npb24gdmlhIGFsdGVybmF0aW9uLlxuICAgIHZhciBtYXRjaGVyID0gbmV3IFJlZ0V4cChbXG4gICAgICAoc2V0dGluZ3MuZXNjYXBlIHx8IG5vTWF0Y2gpLnNvdXJjZSxcbiAgICAgIChzZXR0aW5ncy5pbnRlcnBvbGF0ZSB8fCBub01hdGNoKS5zb3VyY2UsXG4gICAgICAoc2V0dGluZ3MuZXZhbHVhdGUgfHwgbm9NYXRjaCkuc291cmNlXG4gICAgXS5qb2luKCd8JykgKyAnfCQnLCAnZycpO1xuXG4gICAgLy8gQ29tcGlsZSB0aGUgdGVtcGxhdGUgc291cmNlLCBlc2NhcGluZyBzdHJpbmcgbGl0ZXJhbHMgYXBwcm9wcmlhdGVseS5cbiAgICB2YXIgaW5kZXggPSAwO1xuICAgIHZhciBzb3VyY2UgPSBcIl9fcCs9J1wiO1xuICAgIHRleHQucmVwbGFjZShtYXRjaGVyLCBmdW5jdGlvbihtYXRjaCwgZXNjYXBlLCBpbnRlcnBvbGF0ZSwgZXZhbHVhdGUsIG9mZnNldCkge1xuICAgICAgc291cmNlICs9IHRleHQuc2xpY2UoaW5kZXgsIG9mZnNldClcbiAgICAgICAgLnJlcGxhY2UoZXNjYXBlciwgZnVuY3Rpb24obWF0Y2gpIHsgcmV0dXJuICdcXFxcJyArIGVzY2FwZXNbbWF0Y2hdOyB9KTtcblxuICAgICAgaWYgKGVzY2FwZSkge1xuICAgICAgICBzb3VyY2UgKz0gXCInK1xcbigoX190PShcIiArIGVzY2FwZSArIFwiKSk9PW51bGw/Jyc6Xy5lc2NhcGUoX190KSkrXFxuJ1wiO1xuICAgICAgfVxuICAgICAgaWYgKGludGVycG9sYXRlKSB7XG4gICAgICAgIHNvdXJjZSArPSBcIicrXFxuKChfX3Q9KFwiICsgaW50ZXJwb2xhdGUgKyBcIikpPT1udWxsPycnOl9fdCkrXFxuJ1wiO1xuICAgICAgfVxuICAgICAgaWYgKGV2YWx1YXRlKSB7XG4gICAgICAgIHNvdXJjZSArPSBcIic7XFxuXCIgKyBldmFsdWF0ZSArIFwiXFxuX19wKz0nXCI7XG4gICAgICB9XG4gICAgICBpbmRleCA9IG9mZnNldCArIG1hdGNoLmxlbmd0aDtcbiAgICAgIHJldHVybiBtYXRjaDtcbiAgICB9KTtcbiAgICBzb3VyY2UgKz0gXCInO1xcblwiO1xuXG4gICAgLy8gSWYgYSB2YXJpYWJsZSBpcyBub3Qgc3BlY2lmaWVkLCBwbGFjZSBkYXRhIHZhbHVlcyBpbiBsb2NhbCBzY29wZS5cbiAgICBpZiAoIXNldHRpbmdzLnZhcmlhYmxlKSBzb3VyY2UgPSAnd2l0aChvYmp8fHt9KXtcXG4nICsgc291cmNlICsgJ31cXG4nO1xuXG4gICAgc291cmNlID0gXCJ2YXIgX190LF9fcD0nJyxfX2o9QXJyYXkucHJvdG90eXBlLmpvaW4sXCIgK1xuICAgICAgXCJwcmludD1mdW5jdGlvbigpe19fcCs9X19qLmNhbGwoYXJndW1lbnRzLCcnKTt9O1xcblwiICtcbiAgICAgIHNvdXJjZSArIFwicmV0dXJuIF9fcDtcXG5cIjtcblxuICAgIHRyeSB7XG4gICAgICByZW5kZXIgPSBuZXcgRnVuY3Rpb24oc2V0dGluZ3MudmFyaWFibGUgfHwgJ29iaicsICdfJywgc291cmNlKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBlLnNvdXJjZSA9IHNvdXJjZTtcbiAgICAgIHRocm93IGU7XG4gICAgfVxuXG4gICAgaWYgKGRhdGEpIHJldHVybiByZW5kZXIoZGF0YSwgXyk7XG4gICAgdmFyIHRlbXBsYXRlID0gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgcmV0dXJuIHJlbmRlci5jYWxsKHRoaXMsIGRhdGEsIF8pO1xuICAgIH07XG5cbiAgICAvLyBQcm92aWRlIHRoZSBjb21waWxlZCBmdW5jdGlvbiBzb3VyY2UgYXMgYSBjb252ZW5pZW5jZSBmb3IgcHJlY29tcGlsYXRpb24uXG4gICAgdGVtcGxhdGUuc291cmNlID0gJ2Z1bmN0aW9uKCcgKyAoc2V0dGluZ3MudmFyaWFibGUgfHwgJ29iaicpICsgJyl7XFxuJyArIHNvdXJjZSArICd9JztcblxuICAgIHJldHVybiB0ZW1wbGF0ZTtcbiAgfTtcblxuICAvLyBBZGQgYSBcImNoYWluXCIgZnVuY3Rpb24sIHdoaWNoIHdpbGwgZGVsZWdhdGUgdG8gdGhlIHdyYXBwZXIuXG4gIF8uY2hhaW4gPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gXyhvYmopLmNoYWluKCk7XG4gIH07XG5cbiAgLy8gT09QXG4gIC8vIC0tLS0tLS0tLS0tLS0tLVxuICAvLyBJZiBVbmRlcnNjb3JlIGlzIGNhbGxlZCBhcyBhIGZ1bmN0aW9uLCBpdCByZXR1cm5zIGEgd3JhcHBlZCBvYmplY3QgdGhhdFxuICAvLyBjYW4gYmUgdXNlZCBPTy1zdHlsZS4gVGhpcyB3cmFwcGVyIGhvbGRzIGFsdGVyZWQgdmVyc2lvbnMgb2YgYWxsIHRoZVxuICAvLyB1bmRlcnNjb3JlIGZ1bmN0aW9ucy4gV3JhcHBlZCBvYmplY3RzIG1heSBiZSBjaGFpbmVkLlxuXG4gIC8vIEhlbHBlciBmdW5jdGlvbiB0byBjb250aW51ZSBjaGFpbmluZyBpbnRlcm1lZGlhdGUgcmVzdWx0cy5cbiAgdmFyIHJlc3VsdCA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiB0aGlzLl9jaGFpbiA/IF8ob2JqKS5jaGFpbigpIDogb2JqO1xuICB9O1xuXG4gIC8vIEFkZCBhbGwgb2YgdGhlIFVuZGVyc2NvcmUgZnVuY3Rpb25zIHRvIHRoZSB3cmFwcGVyIG9iamVjdC5cbiAgXy5taXhpbihfKTtcblxuICAvLyBBZGQgYWxsIG11dGF0b3IgQXJyYXkgZnVuY3Rpb25zIHRvIHRoZSB3cmFwcGVyLlxuICBlYWNoKFsncG9wJywgJ3B1c2gnLCAncmV2ZXJzZScsICdzaGlmdCcsICdzb3J0JywgJ3NwbGljZScsICd1bnNoaWZ0J10sIGZ1bmN0aW9uKG5hbWUpIHtcbiAgICB2YXIgbWV0aG9kID0gQXJyYXlQcm90b1tuYW1lXTtcbiAgICBfLnByb3RvdHlwZVtuYW1lXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIG9iaiA9IHRoaXMuX3dyYXBwZWQ7XG4gICAgICBtZXRob2QuYXBwbHkob2JqLCBhcmd1bWVudHMpO1xuICAgICAgaWYgKChuYW1lID09ICdzaGlmdCcgfHwgbmFtZSA9PSAnc3BsaWNlJykgJiYgb2JqLmxlbmd0aCA9PT0gMCkgZGVsZXRlIG9ialswXTtcbiAgICAgIHJldHVybiByZXN1bHQuY2FsbCh0aGlzLCBvYmopO1xuICAgIH07XG4gIH0pO1xuXG4gIC8vIEFkZCBhbGwgYWNjZXNzb3IgQXJyYXkgZnVuY3Rpb25zIHRvIHRoZSB3cmFwcGVyLlxuICBlYWNoKFsnY29uY2F0JywgJ2pvaW4nLCAnc2xpY2UnXSwgZnVuY3Rpb24obmFtZSkge1xuICAgIHZhciBtZXRob2QgPSBBcnJheVByb3RvW25hbWVdO1xuICAgIF8ucHJvdG90eXBlW25hbWVdID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gcmVzdWx0LmNhbGwodGhpcywgbWV0aG9kLmFwcGx5KHRoaXMuX3dyYXBwZWQsIGFyZ3VtZW50cykpO1xuICAgIH07XG4gIH0pO1xuXG4gIF8uZXh0ZW5kKF8ucHJvdG90eXBlLCB7XG5cbiAgICAvLyBTdGFydCBjaGFpbmluZyBhIHdyYXBwZWQgVW5kZXJzY29yZSBvYmplY3QuXG4gICAgY2hhaW46IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5fY2hhaW4gPSB0cnVlO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIC8vIEV4dHJhY3RzIHRoZSByZXN1bHQgZnJvbSBhIHdyYXBwZWQgYW5kIGNoYWluZWQgb2JqZWN0LlxuICAgIHZhbHVlOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLl93cmFwcGVkO1xuICAgIH1cblxuICB9KTtcblxufSkuY2FsbCh0aGlzKTtcbiJdfQ==
;
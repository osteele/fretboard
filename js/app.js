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
  var badge, chordName, fingering, labels, name, sortKeys, value, _i, _len, _ref1, _ref2;
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
      value = _ref2[name];
      sortKeys[name] = value;
      if (typeof value === 'boolean') {
        sortKeys[name] = !value;
      }
      badge = value;
      if (value === true) {
        badge = null;
      }
      if (value) {
        labels.push({
          name: name,
          badge: badge
        });
      }
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
            return angular.element($elem).scope().fingering.sortKeys[key];
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


},{"./chord_diagram":"EHWjuh","./fingerings":"/X1WgR","./instruments":"B8u3u9","./layout":"B83s2m","./theory":"80u6C5"}],"EHWjuh":[function(require,module,exports){
var DefaultStyle, FretCount, FretNumbers, SmallStyle, computeChordDiagramDimensions, drawChordDiagram, drawChordDiagramFrets, drawChordDiagramStrings, hsv2css, _, _ref,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

_ = require('underscore');

_ref = require('./instruments'), FretCount = _ref.FretCount, FretNumbers = _ref.FretNumbers;

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

module.exports = {
  defaultStyle: DefaultStyle,
  width: function(instrument) {
    return computeChordDiagramDimensions(instrument).width;
  },
  height: function(instrument) {
    return computeChordDiagramDimensions(instrument).height;
  },
  draw: drawChordDiagram
};


},{"./instruments":"B8u3u9","./utils":"+Nu4mz","underscore":11}],"/X1WgR":[function(require,module,exports){
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
      return f.inversionLetter || '';
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
      fingering.properties[name] = value;
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


},{"./instruments":"B8u3u9","./theory":"80u6C5","./utils":"+Nu4mz","underscore":11,"util":17}],"V9DGE2":[function(require,module,exports){
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
var ChordDiagram, DefaultStyle, IntervalNames, IntervalVectors, drawHarmonicTable, drawText, intervalClassVectors, withGraphicsContext, _, _ref,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

_ = require('underscore');

IntervalNames = require('./theory').IntervalNames;

_ref = require('./layout'), drawText = _ref.drawText, withGraphicsContext = _ref.withGraphicsContext;

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

module.exports = {
  draw: drawHarmonicTable
};


},{"./chord_diagram":"EHWjuh","./layout":"B83s2m","./theory":"80u6C5","underscore":11}],"B8u3u9":[function(require,module,exports){
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
var Context, drawText, withCanvas, withGraphicsContext;

Context = {
  canvas: null
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
  var savedCanvas;
  savedCanvas = Context.canvas;
  try {
    Context.canvas = canvas;
    return cb();
  } finally {
    Context.canvas = savedCanvas;
  }
};

withGraphicsContext = function(cb) {
  var ctx;
  ctx = Context.ctx;
  ctx.save();
  try {
    return cb(ctx);
  } finally {
    ctx.restore();
  }
};

module.exports = {
  withCanvas: withCanvas,
  withGraphicsContext: withGraphicsContext
};


},{}],"e0n95g":[function(require,module,exports){
var ChordDiagramStyle, PI, cos, draw_pitch_diagram, max, min, sin;

PI = Math.PI, cos = Math.cos, sin = Math.sin, min = Math.min, max = Math.max;

ChordDiagramStyle = require('./chord_diagram').defaultStyle;

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

module.exports = {
  draw: draw_pitch_diagram
};


},{"./chord_diagram":"EHWjuh"}],"80u6C5":[function(require,module,exports){
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


},{}],11:[function(require,module,exports){
//     Underscore.js 1.5.2
//     http://underscorejs.org
//     (c) 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
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
  _.VERSION = '1.5.2';

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
      for (var i = 0, length = obj.length; i < length; i++) {
        if (iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      var keys = _.keys(obj);
      for (var i = 0, length = keys.length; i < length; i++) {
        if (iterator.call(context, obj[keys[i]], keys[i], obj) === breaker) return;
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
      results.push(iterator.call(context, value, index, list));
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
      if (iterator.call(context, value, index, list)) results.push(value);
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
    if (_.isEmpty(attrs)) return first ? void 0 : [];
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
  // See [WebKit Bug 80797](https://bugs.webkit.org/show_bug.cgi?id=80797)
  _.max = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.max.apply(Math, obj);
    }
    if (!iterator && _.isEmpty(obj)) return -Infinity;
    var result = {computed : -Infinity, value: -Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed > result.computed && (result = {value : value, computed : computed});
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

  // Shuffle an array, using the modern version of the 
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
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

  // Sample **n** random values from an array.
  // If **n** is not specified, returns a single random element from the array.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function(obj, n, guard) {
    if (arguments.length < 2 || guard) {
      return obj[_.random(obj.length - 1)];
    }
    return _.shuffle(obj).slice(0, Math.max(0, n));
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
        value: value,
        index: index,
        criteria: iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(behavior) {
    return function(obj, value, context) {
      var result = {};
      var iterator = value == null ? _.identity : lookupIterator(value);
      each(obj, function(value, index) {
        var key = iterator.call(context, value, index, obj);
        behavior(result, key, value);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function(result, key, value) {
    (_.has(result, key) ? result[key] : (result[key] = [])).push(value);
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, key, value) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, key) {
    _.has(result, key) ? result[key]++ : result[key] = 1;
  });

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

  // Safely create a real, live array from anything iterable.
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
    return (n == null) || guard ? array[0] : slice.call(array, 0, n);
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
    if ((n == null) || guard) {
      return array[array.length - 1];
    } else {
      return slice.call(array, Math.max(array.length - n, 0));
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
    if (shallow && _.every(input, _.isArray)) {
      return concat.apply(output, input);
    }
    each(input, function(value) {
      if (_.isArray(value) || _.isArguments(value)) {
        shallow ? push.apply(output, value) : flatten(value, shallow, output);
      } else {
        output.push(value);
      }
    });
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
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
    return _.uniq(_.flatten(arguments, true));
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
    var length = _.max(_.pluck(arguments, "length").concat(0));
    var results = new Array(length);
    for (var i = 0; i < length; i++) {
      results[i] = _.pluck(arguments, '' + i);
    }
    return results;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    if (list == null) return {};
    var result = {};
    for (var i = 0, length = list.length; i < length; i++) {
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
    var i = 0, length = array.length;
    if (isSorted) {
      if (typeof isSorted == 'number') {
        i = (isSorted < 0 ? Math.max(0, length + isSorted) : isSorted);
      } else {
        i = _.sortedIndex(array, item);
        return array[i] === item ? i : -1;
      }
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item, isSorted);
    for (; i < length; i++) if (array[i] === item) return i;
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

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(length);

    while(idx < length) {
      range[idx++] = start;
      start += step;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Reusable constructor function for prototype setting.
  var ctor = function(){};

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    var args, bound;
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError;
    args = slice.call(arguments, 2);
    return bound = function() {
      if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
      ctor.prototype = func.prototype;
      var self = new ctor;
      ctor.prototype = null;
      var result = func.apply(self, args.concat(slice.call(arguments)));
      if (Object(result) === result) return result;
      return self;
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
    if (funcs.length === 0) throw new Error("bindAll must be passed function names");
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
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    options || (options = {});
    var later = function() {
      previous = options.leading === false ? 0 : new Date;
      timeout = null;
      result = func.apply(context, args);
    };
    return function() {
      var now = new Date;
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0) {
        clearTimeout(timeout);
        timeout = null;
        previous = now;
        result = func.apply(context, args);
      } else if (!timeout && options.trailing !== false) {
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
    var timeout, args, context, timestamp, result;
    return function() {
      context = this;
      args = arguments;
      timestamp = new Date();
      var later = function() {
        var last = (new Date()) - timestamp;
        if (last < wait) {
          timeout = setTimeout(later, wait - last);
        } else {
          timeout = null;
          if (!immediate) result = func.apply(context, args);
        }
      };
      var callNow = immediate && !timeout;
      if (!timeout) {
        timeout = setTimeout(later, wait);
      }
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
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = new Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = new Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
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
          if (obj[prop] === void 0) obj[prop] = source[prop];
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
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
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
    // Objects with different constructors are not equivalent, but `Object`s
    // from different frames are.
    var aCtor = a.constructor, bCtor = b.constructor;
    if (aCtor !== bCtor && !(_.isFunction(aCtor) && (aCtor instanceof aCtor) &&
                             _.isFunction(bCtor) && (bCtor instanceof bCtor))) {
      return false;
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
    var accum = Array(Math.max(0, n));
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
      "'": '&#x27;'
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

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, property) {
    if (object == null) return void 0;
    var value = object[property];
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    each(_.functions(obj), function(name) {
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

},{"__browserify_process":18}],"./fingerings":[function(require,module,exports){
module.exports=require('/X1WgR');
},{}],"./theory":[function(require,module,exports){
module.exports=require('80u6C5');
},{}],"./utils":[function(require,module,exports){
module.exports=require('+Nu4mz');
},{}],"./layout":[function(require,module,exports){
module.exports=require('B83s2m');
},{}],17:[function(require,module,exports){
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

},{"events":12}],18:[function(require,module,exports){
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

},{}],"./fretboard_diagram":[function(require,module,exports){
module.exports=require('V9DGE2');
},{}],"./chord_diagram":[function(require,module,exports){
module.exports=require('EHWjuh');
},{}],"./instruments":[function(require,module,exports){
module.exports=require('B8u3u9');
},{}],"./harmonic_table":[function(require,module,exports){
module.exports=require('NBDcvj');
},{}],"./pitch_diagram":[function(require,module,exports){
module.exports=require('e0n95g');
},{}]},{},[1,"EHWjuh","/X1WgR","V9DGE2","NBDcvj","B8u3u9","B83s2m","e0n95g","80u6C5","+Nu4mz"])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvb3N0ZWVsZS9Db2RlL2ZyZXRib2FyZC9hcHAvanMvYXBwLmNvZmZlZSIsIi9Vc2Vycy9vc3RlZWxlL0NvZGUvZnJldGJvYXJkL2xpYi9jaG9yZF9kaWFncmFtLmNvZmZlZSIsIi9Vc2Vycy9vc3RlZWxlL0NvZGUvZnJldGJvYXJkL2xpYi9maW5nZXJpbmdzLmNvZmZlZSIsIi9Vc2Vycy9vc3RlZWxlL0NvZGUvZnJldGJvYXJkL2xpYi9mcmV0Ym9hcmRfZGlhZ3JhbS5jb2ZmZWUiLCIvVXNlcnMvb3N0ZWVsZS9Db2RlL2ZyZXRib2FyZC9saWIvaGFybW9uaWNfdGFibGUuY29mZmVlIiwiL1VzZXJzL29zdGVlbGUvQ29kZS9mcmV0Ym9hcmQvbGliL2luc3RydW1lbnRzLmNvZmZlZSIsIi9Vc2Vycy9vc3RlZWxlL0NvZGUvZnJldGJvYXJkL2xpYi9sYXlvdXQuY29mZmVlIiwiL1VzZXJzL29zdGVlbGUvQ29kZS9mcmV0Ym9hcmQvbGliL3BpdGNoX2RpYWdyYW0uY29mZmVlIiwiL1VzZXJzL29zdGVlbGUvQ29kZS9mcmV0Ym9hcmQvbGliL3RoZW9yeS5jb2ZmZWUiLCIvVXNlcnMvb3N0ZWVsZS9Db2RlL2ZyZXRib2FyZC9saWIvdXRpbHMuY29mZmVlIiwiL1VzZXJzL29zdGVlbGUvQ29kZS9mcmV0Ym9hcmQvbm9kZV9tb2R1bGVzL3VuZGVyc2NvcmUvdW5kZXJzY29yZS5qcyIsIi91c3IvbG9jYWwvc2hhcmUvbnBtL2xpYi9ub2RlX21vZHVsZXMvZ3J1bnQtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1idWlsdGlucy9idWlsdGluL2V2ZW50cy5qcyIsIi91c3IvbG9jYWwvc2hhcmUvbnBtL2xpYi9ub2RlX21vZHVsZXMvZ3J1bnQtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1idWlsdGlucy9idWlsdGluL3V0aWwuanMiLCIvdXNyL2xvY2FsL3NoYXJlL25wbS9saWIvbm9kZV9tb2R1bGVzL2dydW50LWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2luc2VydC1tb2R1bGUtZ2xvYmFscy9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFJQSxJQUFBLHVGQUFBOztBQUFBLENBQUEsRUFBZSxJQUFBLEtBQWYsS0FBZTs7QUFDZixDQURBLEVBQ1MsR0FBVCxDQUFTLEdBQUE7O0FBQ1QsQ0FGQSxFQUVjLElBQUEsSUFBZCxJQUFjOztBQUNiLENBSEQsRUFHb0IsSUFBQSxPQUFBLENBSHBCOztBQUtBLENBTEEsQ0FNRSxHQURGLENBQUEsQ0FLSSxHQUFBOztBQVFKLENBbEJBLEVBa0JnQyxFQUFoQyxFQUFPLENBQVAsQ0FBZ0M7Q0FDdEIsQ0FBb0IsS0FBckIsQ0FBUCxDQUFBLEtBQTRCO0NBREU7O0FBR2hDLENBckJBLElBcUJBO0NBQVEsQ0FBQSxDQUFTLEVBQUEsRUFBVCxFQUFVO0NBQWEsQ0FBRCxHQUFGLENBQUEsQ0FBQSxJQUFBO0NBQXBCLEVBQVM7Q0FyQmpCLENBcUJBOztBQU9BLENBNUJBLENBNEJxQyxDQUFyQyxHQUFNLENBQU8sRUFBd0IsRUFBQSxDQUFBLEVBQS9COztBQUVOLENBOUJBLENBOEIrQixDQUE1QixHQUFILEdBQVksS0FBRCxHQUFBO0NBRU4sQ0FBVSxDQURiLENBQUEsS0FBQSxLQUNFO0NBQVcsQ0FBWSxFQUFaLE1BQUEsTUFBQTtDQUFBLENBQTJDLEVBQWIsT0FBQSxpQkFBOUI7Q0FDWCxDQUEyQixFQUY3QixlQUFBO0NBRTZCLENBQVksRUFBWixNQUFBLFFBQUE7Q0FBQSxDQUE2QyxFQUFiLE9BQUEsbUJBQWhDO0NBQzNCLEdBSEYsS0FBQTtDQUdhLENBQVksQ0FBWixDQUFBLE1BQUE7Q0FKSixHQUNUO0NBRFM7O0FBV1gsQ0F6Q0EsQ0F5Q2lDLENBQTlCLEdBQThCLEdBQUMs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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1dkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7OztBQ2xNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6VkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXNDb250ZW50IjpbIiNcbiMgSW1wb3J0c1xuI1xuXG5DaG9yZERpYWdyYW0gPSByZXF1aXJlICcuL2Nob3JkX2RpYWdyYW0nXG5MYXlvdXQgPSByZXF1aXJlICcuL2xheW91dCdcbkluc3RydW1lbnRzID0gcmVxdWlyZSAnLi9pbnN0cnVtZW50cydcbntjaG9yZEZpbmdlcmluZ3N9ID0gcmVxdWlyZSAnLi9maW5nZXJpbmdzJ1xuXG57XG4gIENob3JkXG4gIENob3Jkc1xuICBTY2FsZVxuICBTY2FsZXNcbn0gPSByZXF1aXJlKCcuL3RoZW9yeScpXG5cblxuI1xuIyBFeHRlbnNpb25zXG4jXG5cbiMgcmVxdWlyZWpzIG5lY2Vzc2l0YXRlcyB0aGlzXG5hbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQpLnJlYWR5IC0+XG4gIGFuZ3VsYXIuYm9vdHN0cmFwKGRvY3VtZW50LCBbJ0ZyZXRib2FyZEFwcCddKVxuXG5fLm1peGluIHJldmVyc2U6IChhcnJheSkgLT4gW10uY29uY2F0KGFycmF5KS5yZXZlcnNlKClcblxuXG4jXG4jIEFwcGxpY2F0aW9uXG4jXG5cbmFwcCA9IGFuZ3VsYXIubW9kdWxlICdGcmV0Ym9hcmRBcHAnLCBbJ25nQW5pbWF0ZScsICduZ1JvdXRlJywgJ25nU2FuaXRpemUnXVxuXG5hcHAuY29uZmlnICgkbG9jYXRpb25Qcm92aWRlciwgJHJvdXRlUHJvdmlkZXIpIC0+XG4gICRyb3V0ZVByb3ZpZGVyXG4gICAgLndoZW4oJy8nLCBjb250cm9sbGVyOiAnQ2hvcmRUYWJsZUN0cmwnLCB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9jaG9yZC10YWJsZS5odG1sJylcbiAgICAud2hlbignL2Nob3JkLzpjaG9yZE5hbWUnLCBjb250cm9sbGVyOiAnQ2hvcmREZXRhaWxzQ3RybCcsIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL2Nob3JkLWRldGFpbHMuaHRtbCcpXG4gICAgLm90aGVyd2lzZShyZWRpcmVjdFRvOiAnLycpXG5cblxuI1xuIyBDaG9yZCBUYWJsZVxuI1xuXG5hcHAuY29udHJvbGxlciAnQ2hvcmRUYWJsZUN0cmwnLCAoJHNjb3BlKSAtPlxuICAkc2NvcGUudG9uaWNzID0gWydDJywgJ0QnLCAnRScsICdGJywgJ0cnLCAnQScsICdCJ11cblxuICAkc2NvcGUuZ2V0U2NhbGVDaG9yZHMgPSBkbyAtPlxuICAgICMgVGhlIGNhY2hlIGlzIG5lY2Vzc2FyeSB0byBwcmV2ZW50IGEgZGlnZXN0IGl0ZXJhdGlvbiBlcnJvclxuICAgIGNhY2hlID0ge31cbiAgICAoc2NhbGVOYW1lLCBzZXZlbnRocykgLT5cbiAgICAgIGNhY2hlW1tzY2FsZU5hbWUsIHNldmVudGhzXV0gb3I9IFNjYWxlLmZpbmQoc2NhbGVOYW1lKS5jaG9yZHMoc2V2ZW50aHM6IHNldmVudGhzKVxuXG5cbiNcbiMgQ2hvcmQgRGV0YWlsc1xuI1xuXG5hcHAuY29udHJvbGxlciAnQ2hvcmREZXRhaWxzQ3RybCcsICgkc2NvcGUsICRyb3V0ZVBhcmFtcykgLT5cbiAgY2hvcmROYW1lID0gJHJvdXRlUGFyYW1zLmNob3JkTmFtZS5yZXBsYWNlKCcmIzk4Mzk7JywgJyMnKVxuICAkc2NvcGUuY2hvcmQgPSBDaG9yZC5maW5kKGNob3JkTmFtZSlcbiAgJHNjb3BlLmluc3RydW1lbnQgPSBJbnN0cnVtZW50cy5EZWZhdWx0XG4gICRzY29wZS5maW5nZXJpbmdzID0gY2hvcmRGaW5nZXJpbmdzKCRzY29wZS5jaG9yZCwgJHNjb3BlLmluc3RydW1lbnQsIGFsbFBvc2l0aW9uczogdHJ1ZSlcblxuICAjXG4gICMgTGFiZWxzXG4gICNcblxuICBmb3IgZmluZ2VyaW5nIGluICRzY29wZS5maW5nZXJpbmdzXG4gICAgbGFiZWxzID0gW11cbiAgICBzb3J0S2V5cyA9IHt9XG4gICAgZm9yIG5hbWUsIHZhbHVlIG9mIGZpbmdlcmluZy5wcm9wZXJ0aWVzXG4gICAgICBzb3J0S2V5c1tuYW1lXSA9IHZhbHVlXG4gICAgICBzb3J0S2V5c1tuYW1lXSA9ICF2YWx1ZSBpZiB0eXBlb2YgdmFsdWUgPT0gJ2Jvb2xlYW4nXG4gICAgICBiYWRnZSA9IHZhbHVlXG4gICAgICBiYWRnZSA9IG51bGwgaWYgdmFsdWUgPT0gdHJ1ZVxuICAgICAgbGFiZWxzLnB1c2gge25hbWUsIGJhZGdlfSBpZiB2YWx1ZVxuICAgIGZpbmdlcmluZy5sYWJlbHMgPSBsYWJlbHMuc29ydCgpXG4gICAgZmluZ2VyaW5nLnNvcnRLZXlzID0gc29ydEtleXNcblxuICAjXG4gICMgU29ydGluZ1xuICAjXG5cbiAgJHNjb3BlLmtleXMgPSBfLmNoYWluKCRzY29wZS5maW5nZXJpbmdzKS5wbHVjaygncHJvcGVydGllcycpLm1hcChfLmtleXMpLmZsYXR0ZW4oKS51bmlxKCkudmFsdWUoKVxuICAkc2NvcGUuc29ydEtleSA9ICcnXG5cbiAgJHNjb3BlLm9yZGVyQnkgPSAoc29ydEtleSkgLT5cbiAgICAkc2NvcGUuc29ydEtleSA9IHNvcnRLZXlcbiAgICAkKCcjdm9pY2luZ3MnKS5pc290b3BlKHNvcnRCeTogc29ydEtleSlcbiAgICAjIHZhbHVlcyA9IF8uY29tcGFjdChmaW5nZXJpbmdzLm1hcCAoZikgLT4gZi5wcm9wZXJ0aWVzW3NvcnRLZXldKVxuICAgIGZpbmdlcmluZ3MgPSAkc2NvcGUuZmluZ2VyaW5nc1xuICAgIGZvciBmaW5nZXJpbmcgaW4gZmluZ2VyaW5nc1xuICAgICAgbGFiZWxzID0gZmluZ2VyaW5nLmxhYmVscy5maWx0ZXIgKGxhYmVsKSAtPiBsYWJlbC5uYW1lID09IHNvcnRLZXlcbiAgICAgIGZpbmdlcmluZy5sYWJlbHMgPSBsYWJlbHMuY29uY2F0KF8uZGlmZmVyZW5jZShmaW5nZXJpbmcubGFiZWxzLCBsYWJlbHMpKSBpZiBsYWJlbHMubGVuZ3RoXG5cblxuI1xuIyBEaXJlY3RpdmVzXG4jXG5cbmFwcC5kaXJlY3RpdmUgJ2lzb3RvcGVDb250YWluZXInLCAtPlxuICByZXN0cmljdDogJ0NBRSdcbiAgbGluazpcbiAgICBwb3N0OiAoc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSAtPlxuICAgICAgc29ydERhdGEgPSB7fVxuICAgICAgc2NvcGUua2V5cy5tYXAgKGtleSkgLT5cbiAgICAgICAgc29ydERhdGFba2V5XSA9ICgkZWxlbSkgLT5cbiAgICAgICAgICByZXR1cm4gYW5ndWxhci5lbGVtZW50KCRlbGVtKS5zY29wZSgpLmZpbmdlcmluZy5zb3J0S2V5c1trZXldXG4gICAgICAkKGVsZW1lbnQpLmlzb3RvcGVcbiAgICAgICAgYW5pbWF0aW9uRW5naW5lU3RyaW5nOiAnY3NzJ1xuICAgICAgICBpdGVtU2VsZWN0b3I6ICdbaXNvdG9wZS1pdGVtXSdcbiAgICAgICAgbGF5b3V0TW9kZTogJ2ZpdFJvd3MnXG4gICAgICAgIGdldFNvcnREYXRhOiBzb3J0RGF0YVxuXG5hcHAuZGlyZWN0aXZlICdpc290b3BlSXRlbScsICgkdGltZW91dCkgLT5cbiAgcmVzdHJpY3Q6ICdBRSdcbiAgbGluazogKHNjb3BlLCBlbGVtZW50LCBhdHRycykgLT5cbiAgICByZXR1cm4gdW5sZXNzIHNjb3BlLiRsYXN0XG4gICAgJGVsZW1lbnQgPSAkKGVsZW1lbnQpXG4gICAgZWxlbWVudC5yZWFkeSAtPlxuICAgICAgJGNvbnRhaW5lciA9ICRlbGVtZW50LnBhcmVudCgnLmlzb3RvcGUnKVxuICAgICAgJGNvbnRhaW5lci5pc290b3BlKCdyZWxvYWRJdGVtcycpLmlzb3RvcGUoc29ydEJ5OiAnYmFycmVzJykuY3NzKCd2aXNpYmlsaXR5JywgJ2luaGVyaXQnKVxuXG5hcHAuZGlyZWN0aXZlICdjaG9yZCcsIC0+XG4gIHJlc3RyaWN0OiAnQ0UnXG4gIHJlcGxhY2U6IHRydWVcbiAgdGVtcGxhdGU6IC0+XG4gICAgaW5zdHJ1bWVudCA9IEluc3RydW1lbnRzLkRlZmF1bHRcbiAgICBkaW1lbnNpb25zID0ge3dpZHRoOiBDaG9yZERpYWdyYW0ud2lkdGgoaW5zdHJ1bWVudCksIGhlaWdodDogQ2hvcmREaWFncmFtLmhlaWdodChpbnN0cnVtZW50KX1cbiAgICBcIjxkaXY+PHNwYW4gY2xhc3M9J2ZyZXROdW1iZXInIG5nOnNob3c9J3RvcEZyZXROdW1iZXInPnt7dG9wRnJldE51bWJlcn19PC9zcGFuPlwiICtcbiAgICAgIFwiPGNhbnZhcyB3aWR0aD0nI3tkaW1lbnNpb25zLndpZHRofScgaGVpZ2h0PScje2RpbWVuc2lvbnMuaGVpZ2h0fScvPjwvZGl2PlwiXG4gIHNjb3BlOiB7Y2hvcmQ6ICc9JywgZmluZ2VyaW5nOiAnPT8nfVxuICBsaW5rOiAoc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSAtPlxuICAgIGNhbnZhcyA9IGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignY2FudmFzJylcbiAgICBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKVxuICAgIGluc3RydW1lbnQgPSBJbnN0cnVtZW50cy5EZWZhdWx0XG4gICAgZG8gLT5cbiAgICAgIHtjaG9yZCwgZmluZ2VyaW5nfSA9IHNjb3BlXG4gICAgICBmaW5nZXJpbmdzID0gY2hvcmRGaW5nZXJpbmdzKGNob3JkLCBpbnN0cnVtZW50KVxuICAgICAgZmluZ2VyaW5nIG9yPSBmaW5nZXJpbmdzWzBdXG4gICAgICByZXR1cm4gdW5sZXNzIGZpbmdlcmluZ1xuICAgICAgY3R4LmNsZWFyUmVjdCAwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHRcbiAgICAgIHt0b3BGcmV0fSA9IENob3JkRGlhZ3JhbS5kcmF3IGN0eCwgaW5zdHJ1bWVudCwgZmluZ2VyaW5nLnBvc2l0aW9ucywgYmFycmVzOiBmaW5nZXJpbmcuYmFycmVzXG4gICAgICBzY29wZS50b3BGcmV0TnVtYmVyID0gdG9wRnJldCBpZiB0b3BGcmV0ID4gMFxuXG5hcHAuZmlsdGVyICdyYWlzZUFjY2lkZW50YWxzJywgLT5cbiAgKG5hbWUpIC0+XG4gICAgbmFtZS5yZXBsYWNlKC8oW+KZr+KZrV0pLywgJzxzdXA+JDE8L3N1cD4nKVxuIiwiXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUnXG5cbntcbiAgRnJldENvdW50XG4gIEZyZXROdW1iZXJzXG59ID0gcmVxdWlyZSAnLi9pbnN0cnVtZW50cydcblxuI1xuIyBTdHlsZVxuI1xuXG57aHN2MmNzc30gPSByZXF1aXJlICcuL3V0aWxzJ1xuXG5TbWFsbFN0eWxlID1cbiAgaF9ndXR0ZXI6IDVcbiAgdl9ndXR0ZXI6IDVcbiAgc3RyaW5nX3NwYWNpbmc6IDZcbiAgZnJldF9oZWlnaHQ6IDhcbiAgYWJvdmVfZnJldGJvYXJkOiA4XG4gIG5vdGVfcmFkaXVzOiAxXG4gIGNsb3NlZF9zdHJpbmdfZm9udHNpemU6IDRcbiAgY2hvcmRfZGVncmVlX2NvbG9yczogWydyZWQnLCAnYmx1ZScsICdncmVlbicsICdvcmFuZ2UnXVxuICBpbnRlcnZhbENsYXNzX2NvbG9yczogWzAuLi4xMl0ubWFwIChuKSAtPlxuICAgICMgaSA9ICg3ICogbikgJSAxMiAgIyBjb2xvciBieSBjaXJjbGUgb2YgZmlmdGggYXNjZW5zaW9uXG4gICAgaHN2MmNzcyBoOiBuICogMzYwIC8gMTIsIHM6IDEsIHY6IDFcblxuRGVmYXVsdFN0eWxlID0gXy5leHRlbmQge30sIFNtYWxsU3R5bGUsXG4gIHN0cmluZ19zcGFjaW5nOiAxMlxuICBmcmV0X2hlaWdodDogMTZcbiAgbm90ZV9yYWRpdXM6IDNcbiAgY2xvc2VkX3N0cmluZ19mb250c2l6ZTogOFxuXG5jb21wdXRlQ2hvcmREaWFncmFtRGltZW5zaW9ucyA9IChpbnN0cnVtZW50LCBzdHlsZT1EZWZhdWx0U3R5bGUpIC0+XG4gIHtcbiAgICB3aWR0aDogMiAqIHN0eWxlLmhfZ3V0dGVyICsgKGluc3RydW1lbnQuc3RyaW5ncyAtIDEpICogc3R5bGUuc3RyaW5nX3NwYWNpbmdcbiAgICBoZWlnaHQ6IDIgKiBzdHlsZS52X2d1dHRlciArIChzdHlsZS5mcmV0X2hlaWdodCArIDIpICogRnJldENvdW50XG4gIH1cblxuXG4jXG4jIERyYXdpbmcgTWV0aG9kc1xuI1xuXG5kcmF3Q2hvcmREaWFncmFtU3RyaW5ncyA9IChjdHgsIGluc3RydW1lbnQsIG9wdGlvbnM9e30pIC0+XG4gIHN0eWxlID0gRGVmYXVsdFN0eWxlXG4gIGZvciBzdHJpbmcgaW4gaW5zdHJ1bWVudC5zdHJpbmdOdW1iZXJzXG4gICAgeCA9IHN0cmluZyAqIHN0eWxlLnN0cmluZ19zcGFjaW5nICsgc3R5bGUuaF9ndXR0ZXJcbiAgICBjdHguYmVnaW5QYXRoKClcbiAgICBjdHgubW92ZVRvIHgsIHN0eWxlLnZfZ3V0dGVyICsgc3R5bGUuYWJvdmVfZnJldGJvYXJkXG4gICAgY3R4LmxpbmVUbyB4LCBzdHlsZS52X2d1dHRlciArIHN0eWxlLmFib3ZlX2ZyZXRib2FyZCArIEZyZXRDb3VudCAqIHN0eWxlLmZyZXRfaGVpZ2h0XG4gICAgY3R4LnN0cm9rZVN0eWxlID0gKGlmIG9wdGlvbnMuZGltU3RyaW5ncyBhbmQgc3RyaW5nIGluIG9wdGlvbnMuZGltU3RyaW5ncyB0aGVuICdyZ2JhKDAsMCwwLDAuMiknIGVsc2UgJ2JsYWNrJylcbiAgICBjdHguc3Ryb2tlKClcblxuZHJhd0Nob3JkRGlhZ3JhbUZyZXRzID0gKGN0eCwgaW5zdHJ1bWVudCwge2RyYXdOdXR9PXtkcmF3TnV0OiB0cnVlfSkgLT5cbiAgc3R5bGUgPSBEZWZhdWx0U3R5bGVcbiAgY3R4LnN0cm9rZVN0eWxlID0gJ2JsYWNrJ1xuICBmb3IgZnJldCBpbiBGcmV0TnVtYmVyc1xuICAgIHkgPSBzdHlsZS52X2d1dHRlciArIHN0eWxlLmFib3ZlX2ZyZXRib2FyZCArIGZyZXQgKiBzdHlsZS5mcmV0X2hlaWdodFxuICAgIGN0eC5iZWdpblBhdGgoKVxuICAgIGN0eC5tb3ZlVG8gc3R5bGUudl9ndXR0ZXIgLSAwLjUsIHlcbiAgICBjdHgubGluZVRvIHN0eWxlLnZfZ3V0dGVyICsgMC41ICsgKGluc3RydW1lbnQuc3RyaW5ncyAtIDEpICogc3R5bGUuc3RyaW5nX3NwYWNpbmcsIHlcbiAgICBjdHgubGluZVdpZHRoID0gMyBpZiBmcmV0ID09IDAgYW5kIGRyYXdOdXRcbiAgICBjdHguc3Ryb2tlKClcbiAgICBjdHgubGluZVdpZHRoID0gMVxuXG5kcmF3Q2hvcmREaWFncmFtID0gKGN0eCwgaW5zdHJ1bWVudCwgcG9zaXRpb25zLCBvcHRpb25zPXt9KSAtPlxuICBkZWZhdWx0cyA9IHtkcmF3Q2xvc2VkU3RyaW5nczogdHJ1ZSwgZHJhd051dDogdHJ1ZSwgZHk6IDAsIHN0eWxlOiBEZWZhdWx0U3R5bGV9XG4gIG9wdGlvbnMgPSBfLmV4dGVuZCBkZWZhdWx0cywgb3B0aW9uc1xuICB7YmFycmVzLCBkeSwgZHJhd0Nsb3NlZFN0cmluZ3MsIGRyYXdOdXQsIHN0eWxlfSA9IG9wdGlvbnNcblxuICB0b3BGcmV0ID0gMFxuICBmcmV0cyA9IChmcmV0IGZvciB7ZnJldH0gaW4gcG9zaXRpb25zIHdoZW4gZnJldCAhPSAwKVxuICBsb3dlc3RGcmV0ID0gTWF0aC5taW4oZnJldHMuLi4pXG4gIGhpZ2hlc3RGcmV0ID0gTWF0aC5tYXgoZnJldHMuLi4pXG4gIGlmIGhpZ2hlc3RGcmV0ID4gNFxuICAgIHRvcEZyZXQgPSBsb3dlc3RGcmV0IC0gMVxuICAgIGRyYXdOdXQgPSBmYWxzZVxuXG4gIGlmIG9wdGlvbnMuZGltVW51c2VkU3RyaW5nc1xuICAgIHVzZWRTdHJpbmdzID0gKHN0cmluZyBmb3Ige3N0cmluZ30gaW4gcG9zaXRpb25zKVxuICAgIG9wdGlvbnMuZGltU3RyaW5ncyA9IChzdHJpbmcgZm9yIHN0cmluZyBpbiBpbnN0cnVtZW50LnN0cmluZ051bWJlcnMgd2hlbiBzdHJpbmcgbm90IGluIHVzZWRTdHJpbmdzKVxuXG4gIGZpbmdlckNvb3JkaW5hdGVzID0gKHtzdHJpbmcsIGZyZXR9KSAtPlxuICAgIGZyZXQgLT0gdG9wRnJldCBpZiBmcmV0ID4gMFxuICAgIHJldHVybiB7XG4gICAgICB4OiBzdHlsZS5oX2d1dHRlciArIHN0cmluZyAqIHN0eWxlLnN0cmluZ19zcGFjaW5nLFxuICAgICAgeTogc3R5bGUudl9ndXR0ZXIgKyBzdHlsZS5hYm92ZV9mcmV0Ym9hcmQgKyAoZnJldCAtIDAuNSkgKiBzdHlsZS5mcmV0X2hlaWdodCArIGR5XG4gICAgfVxuXG4gIGRyYXdGaW5nZXJQb3NpdGlvbiA9IChwb3NpdGlvbiwgb3B0aW9ucz17fSkgLT5cbiAgICB7aXNSb290LCBjb2xvcn0gPSBvcHRpb25zXG4gICAge3gsIHl9ID0gZmluZ2VyQ29vcmRpbmF0ZXMocG9zaXRpb24pXG4gICAgY3R4LmZpbGxTdHlsZSA9IGNvbG9yIG9yIChpZiBpc1Jvb3QgdGhlbiAncmVkJyBlbHNlICd3aGl0ZScpXG4gICAgY3R4LnN0cm9rZVN0eWxlID0gY29sb3Igb3IgKGlmIGlzUm9vdCB0aGVuICdyZWQnIGVsc2UgJ2JsYWNrJylcbiAgICBjdHgubGluZVdpZHRoID0gMVxuICAgIGN0eC5iZWdpblBhdGgoKVxuICAgIGlmIGlzUm9vdCBhbmQgcG9zaXRpb24uZnJldFxuICAgICAgZG8gKHI9c3R5bGUubm90ZV9yYWRpdXMpIC0+XG4gICAgICAgIGN0eC5yZWN0IHggLSByLCB5IC0gciwgMiAqIHIsIDIgKiByXG4gICAgZWxzZVxuICAgICAgY3R4LmFyYyB4LCB5LCBzdHlsZS5ub3RlX3JhZGl1cywgMCwgTWF0aC5QSSAqIDIsIGZhbHNlXG4gICAgY3R4LmZpbGwoKSBpZiBwb3NpdGlvbi5mcmV0ID4gMCBvciBpc1Jvb3RcbiAgICBjdHguc3Ryb2tlKClcblxuICBkcmF3QmFycmVzID0gLT5cbiAgICBjdHguZmlsbFN0eWxlID0gJ2JsYWNrJ1xuICAgIGZvciB7ZnJldCwgZmlyc3RTdHJpbmcsIHN0cmluZ0NvdW50fSBpbiBiYXJyZXNcbiAgICAgIHt4OiB4MSwgeX0gPSBmaW5nZXJDb29yZGluYXRlcyB7c3RyaW5nOiBmaXJzdFN0cmluZywgZnJldH1cbiAgICAgIHt4OiB4Mn0gPSBmaW5nZXJDb29yZGluYXRlcyB7c3RyaW5nOiBmaXJzdFN0cmluZyArIHN0cmluZ0NvdW50IC0gMSwgZnJldH1cbiAgICAgIHcgPSB4MiAtIHgxXG4gICAgICBjdHguc2F2ZSgpXG4gICAgICBjdHgudHJhbnNsYXRlICh4MSArIHgyKSAvIDIsIHkgLSBzdHlsZS5mcmV0X2hlaWdodCAqIC4yNVxuICAgICAgY3R4LmJlZ2luUGF0aCgpXG4gICAgICBlY2NlbnRyaWNpdHkgPSAxMFxuICAgICAgZG8gLT5cbiAgICAgICAgY3R4LnNhdmUoKVxuICAgICAgICBjdHguc2NhbGUgdywgZWNjZW50cmljaXR5XG4gICAgICAgIGN0eC5hcmMgMCwgMCwgc3R5bGUuc3RyaW5nX3NwYWNpbmcgLyAyIC8gZWNjZW50cmljaXR5LCBNYXRoLlBJLCAwLCBmYWxzZVxuICAgICAgICBjdHgucmVzdG9yZSgpXG4gICAgICBkbyAtPlxuICAgICAgICBjdHguc2F2ZSgpXG4gICAgICAgIGN0eC5zY2FsZSB3LCAxNFxuICAgICAgICBjdHguYXJjIDAsIDAsIHN0eWxlLnN0cmluZ19zcGFjaW5nIC8gMiAvIGVjY2VudHJpY2l0eSwgMCwgTWF0aC5QSSwgdHJ1ZVxuICAgICAgICBjdHgucmVzdG9yZSgpXG4gICAgICBjdHguZmlsbCgpXG4gICAgICBjdHgucmVzdG9yZSgpXG4gICAgICAjIGN0eC5maWxsU3R5bGUgPSAncmdiYSgwLDAsMCwgMC41KSdcbiAgICAgICMgY3R4LmJlZ2luUGF0aCgpXG4gICAgICAjIGN0eC5hcmMgeDEsIHksIHN0eWxlLnN0cmluZ19zcGFjaW5nIC8gMiwgTWF0aC5QSSAqIDEvMiwgTWF0aC5QSSAqIDMvMiwgZmFsc2VcbiAgICAgICMgY3R4LmFyYyB4MiwgeSwgc3R5bGUuc3RyaW5nX3NwYWNpbmcgLyAyLCBNYXRoLlBJICogMy8yLCBNYXRoLlBJICogMS8yLCBmYWxzZVxuICAgICAgIyBjdHguZmlsbCgpXG5cbiAgZHJhd0ZpbmdlclBvc2l0aW9ucyA9IC0+XG4gICAgZm9yIHBvc2l0aW9uIGluIHBvc2l0aW9uc1xuICAgICAgZGVmYXVsdF9vcHRpb25zID1cbiAgICAgICAgY29sb3I6IHN0eWxlLmludGVydmFsQ2xhc3NfY29sb3JzW3Bvc2l0aW9uLmludGVydmFsQ2xhc3NdXG4gICAgICAgIGlzUm9vdDogKHBvc2l0aW9uLmludGVydmFsQ2xhc3MgPT0gMClcbiAgICAgIGRyYXdGaW5nZXJQb3NpdGlvbiBwb3NpdGlvbiwgXy5leHRlbmQoZGVmYXVsdF9vcHRpb25zLCBwb3NpdGlvbilcblxuICBkcmF3Q2xvc2VkU3RyaW5ncyA9IC0+XG4gICAgZnJldHRlZF9zdHJpbmdzID0gW11cbiAgICBmcmV0dGVkX3N0cmluZ3NbcG9zaXRpb24uc3RyaW5nXSA9IHRydWUgZm9yIHBvc2l0aW9uIGluIHBvc2l0aW9uc1xuICAgIGNsb3NlZF9zdHJpbmdzID0gKHN0cmluZyBmb3Igc3RyaW5nIGluIGluc3RydW1lbnQuc3RyaW5nTnVtYmVycyB3aGVuIG5vdCBmcmV0dGVkX3N0cmluZ3Nbc3RyaW5nXSlcbiAgICByID0gc3R5bGUubm90ZV9yYWRpdXNcbiAgICBjdHguZmlsbFN0eWxlID0gJ2JsYWNrJ1xuICAgIGZvciBzdHJpbmcgaW4gY2xvc2VkX3N0cmluZ3NcbiAgICAgIHt4LCB5fSA9IGZpbmdlckNvb3JkaW5hdGVzIHtzdHJpbmcsIGZyZXQ6IDB9XG4gICAgICBjdHguc3Ryb2tlU3R5bGUgPSAnYmxhY2snXG4gICAgICBjdHguYmVnaW5QYXRoKClcbiAgICAgIGN0eC5tb3ZlVG8geCAtIHIsIHkgLSByXG4gICAgICBjdHgubGluZVRvIHggKyByLCB5ICsgclxuICAgICAgY3R4Lm1vdmVUbyB4IC0gciwgeSArIHJcbiAgICAgIGN0eC5saW5lVG8geCArIHIsIHkgLSByXG4gICAgICBjdHguc3Ryb2tlKClcblxuICBkcmF3Q2hvcmREaWFncmFtU3RyaW5ncyBjdHgsIGluc3RydW1lbnQsIG9wdGlvbnNcbiAgZHJhd0Nob3JkRGlhZ3JhbUZyZXRzIGN0eCwgaW5zdHJ1bWVudCwgZHJhd051dDogZHJhd051dFxuICBkcmF3QmFycmVzKCkgaWYgYmFycmVzXG4gIGRyYXdGaW5nZXJQb3NpdGlvbnMoKSBpZiBwb3NpdGlvbnNcbiAgZHJhd0Nsb3NlZFN0cmluZ3MoKSBpZiBwb3NpdGlvbnMgYW5kIG9wdGlvbnMuZHJhd0Nsb3NlZFN0cmluZ3NcbiAgcmV0dXJuIHt0b3BGcmV0fVxuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIGRlZmF1bHRTdHlsZTogRGVmYXVsdFN0eWxlXG4gIHdpZHRoOiAoaW5zdHJ1bWVudCkgLT4gY29tcHV0ZUNob3JkRGlhZ3JhbURpbWVuc2lvbnMoaW5zdHJ1bWVudCkud2lkdGhcbiAgaGVpZ2h0OiAoaW5zdHJ1bWVudCkgLT4gY29tcHV0ZUNob3JkRGlhZ3JhbURpbWVuc2lvbnMoaW5zdHJ1bWVudCkuaGVpZ2h0XG4gIGRyYXc6IGRyYXdDaG9yZERpYWdyYW1cbiIsInV0aWwgPSByZXF1aXJlICd1dGlsJ1xuXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUnXG57Z2V0UGl0Y2hDbGFzc05hbWUsIGludGVydmFsQ2xhc3NEaWZmZXJlbmNlfSA9IHJlcXVpcmUgJy4vdGhlb3J5J1xuSW5zdHJ1bWVudHMgPSByZXF1aXJlICcuL2luc3RydW1lbnRzJ1xuXG57XG4gIEZyZXROdW1iZXJzXG4gIGZyZXRib2FyZFBvc2l0aW9uc0VhY2hcbiAgcGl0Y2hOdW1iZXJGb3JQb3NpdGlvblxufSA9IEluc3RydW1lbnRzXG5cbnJlcXVpcmUgJy4vdXRpbHMnXG5cbiMgVGhlc2UgYXJlIFwiZmluZ2VyaW5nc1wiLCBub3QgXCJ2b2ljaW5nc1wiLCBiZWNhdXNlIHRoZXkgYWxzbyBpbmNsdWRlIGJhcnJlIGluZm9ybWF0aW9uLlxuY2xhc3MgRmluZ2VyaW5nXG4gIGNvbnN0cnVjdG9yOiAoe0Bwb3NpdGlvbnMsIEBjaG9yZCwgQGJhcnJlcywgQGluc3RydW1lbnR9KSAtPlxuICAgIEBwb3NpdGlvbnMuc29ydCAoYSwgYikgLT4gYS5zdHJpbmcgLSBiLnN0cmluZ1xuICAgIEBwcm9wZXJ0aWVzID0ge31cblxuICBAY2FjaGVkX2dldHRlciAnZnJldHN0cmluZycsIC0+XG4gICAgZnJldEFycmF5ID0gKC0xIGZvciBzIGluIEBpbnN0cnVtZW50LnN0cmluZ051bWJlcnMpXG4gICAgZnJldEFycmF5W3N0cmluZ10gPSBmcmV0IGZvciB7c3RyaW5nLCBmcmV0fSBpbiBAcG9zaXRpb25zXG4gICAgKChpZiB4ID49IDAgdGhlbiB4IGVsc2UgJ3gnKSBmb3IgeCBpbiBmcmV0QXJyYXkpLmpvaW4oJycpXG5cbiAgQGNhY2hlZF9nZXR0ZXIgJ2Nob3JkTmFtZScsIC0+XG4gICAgbmFtZSA9IEBjaG9yZC5uYW1lXG4gICAgbmFtZSArPSBcIiAvICN7Z2V0UGl0Y2hDbGFzc05hbWUoQGluc3RydW1lbnQucGl0Y2hBdChAcG9zaXRpb25zWzBdKSl9XCIgaWYgQGludmVyc2lvbiA+IDBcbiAgICByZXR1cm4gbmFtZVxuXG4gICMgQGNhY2hlZF9nZXR0ZXIgJ3BpdGNoZXMnLCAtPlxuICAjICAgKEBpbnN0cnVtZW50LnBpdGNoQXQocG9zaXRpb25zKSBmb3IgcG9zaXRpb25zIGluIEBwb3NpdGlvbnMpXG5cbiAgIyBAY2FjaGVkX2dldHRlciAnaW50ZXJ2YWxzJywgLT5cbiAgIyAgIF8udW5pcShpbnRlcnZhbENsYXNzRGlmZmVyZW5jZShAY2hvcmQucm9vdFBpdGNoLCBwaXRjaENsYXNzKSBmb3IgcGl0Y2hDbGFzcyBpbiBALnBpdGNoZXMpXG5cbiAgQGNhY2hlZF9nZXR0ZXIgJ2ludmVyc2lvbicsIC0+XG4gICAgQGNob3JkLnBpdGNoQ2xhc3Nlcy5pbmRleE9mIGludGVydmFsQ2xhc3NEaWZmZXJlbmNlKEBjaG9yZC5yb290UGl0Y2gsIEBpbnN0cnVtZW50LnBpdGNoQXQoQHBvc2l0aW9uc1swXSkpXG5cbiAgQGNhY2hlZF9nZXR0ZXIgJ2ludmVyc2lvbkxldHRlcicsIC0+XG4gICAgcmV0dXJuIHVubGVzcyBAaW52ZXJzaW9uID4gMFxuICAgIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlKDk2ICsgQGludmVyc2lvbilcblxuXG4jXG4jIEJhcnJlc1xuI1xuXG5wb3dlcnNldCA9IChhcnJheSkgLT5cbiAgcmV0dXJuIFtbXV0gdW5sZXNzIGFycmF5Lmxlbmd0aFxuICBbeCwgeHMuLi5dID0gYXJyYXlcbiAgdGFpbCA9IHBvd2Vyc2V0KHhzKVxuICByZXR1cm4gdGFpbC5jb25jYXQoW3hdLmNvbmNhdCh5cykgZm9yIHlzIGluIHRhaWwpXG5cbiMgUmV0dXJucyBhbiBhcnJheSBvZiBzdHJpbmdzIGluZGV4ZWQgYnkgZnJldCBudW1iZXIuIEVhY2ggc3RyaW5nXG4jIGhhcyBhIGNoYXJhY3RlciBhdCBlYWNoIHN0cmluZyBwb3NpdGlvbjpcbiMgJz0nID0gZnJldHRlZCBhdCB0aGlzIGZyZXRcbiMgJz4nID0gZnJldHRlZCBhdCBhIGhpZ2hlciBmcmV0XG4jICc8JyA9IGZyZXR0ZWQgYXQgYSBsb3dlciBmcmV0LCBvciBvcGVuXG4jICd4JyA9IG11dGVkXG5jb21wdXRlQmFycmVDYW5kaWRhdGVTdHJpbmdzID0gKGluc3RydW1lbnQsIGZyZXRBcnJheSkgLT5cbiAgY29kZVN0cmluZ3MgPSBbXVxuICBmb3IgcmVmZXJlbmNlRnJldCBpbiBmcmV0QXJyYXlcbiAgICBjb250aW51ZSB1bmxlc3MgdHlwZW9mKHJlZmVyZW5jZUZyZXQpID09ICdudW1iZXInXG4gICAgY29kZVN0cmluZ3NbcmVmZXJlbmNlRnJldF0gb3I9IChmb3IgZnJldCBpbiBmcmV0QXJyYXlcbiAgICAgIGlmIGZyZXQgPCByZWZlcmVuY2VGcmV0XG4gICAgICAgICc8J1xuICAgICAgZWxzZSBpZiBmcmV0ID4gcmVmZXJlbmNlRnJldFxuICAgICAgICAnPidcbiAgICAgIGVsc2UgaWYgZnJldCA9PSByZWZlcmVuY2VGcmV0XG4gICAgICAgICc9J1xuICAgICAgZWxzZVxuICAgICAgICAneCcpLmpvaW4oJycpXG4gIHJldHVybiBjb2RlU3RyaW5nc1xuXG5maW5kQmFycmVzID0gKGluc3RydW1lbnQsIGZyZXRBcnJheSkgLT5cbiAgYmFycmVzID0gW11cbiAgZm9yIGNvZGVTdHJpbmcsIGZyZXQgaW4gY29tcHV0ZUJhcnJlQ2FuZGlkYXRlU3RyaW5ncyhpbnN0cnVtZW50LCBmcmV0QXJyYXkpXG4gICAgY29udGludWUgaWYgZnJldCA9PSAwXG4gICAgY29udGludWUgdW5sZXNzIGNvZGVTdHJpbmdcbiAgICBtYXRjaCA9IGNvZGVTdHJpbmcubWF0Y2goLyg9Wz49XSspLylcbiAgICBjb250aW51ZSB1bmxlc3MgbWF0Y2hcbiAgICBydW4gPSBtYXRjaFsxXVxuICAgIGNvbnRpbnVlIHVubGVzcyBydW4ubWF0Y2goL1xcPS9nKS5sZW5ndGggPiAxXG4gICAgYmFycmVzLnB1c2hcbiAgICAgIGZyZXQ6IGZyZXRcbiAgICAgIGZpcnN0U3RyaW5nOiBtYXRjaC5pbmRleFxuICAgICAgc3RyaW5nQ291bnQ6IHJ1bi5sZW5ndGhcbiAgICAgIGZpbmdlclJlcGxhY2VtZW50Q291bnQ6IHJ1bi5tYXRjaCgvXFw9L2cpLmxlbmd0aFxuICByZXR1cm4gYmFycmVzXG5cbmNvbGxlY3RCYXJyZVNldHMgPSAoaW5zdHJ1bWVudCwgZnJldEFycmF5KSAtPlxuICBiYXJyZXMgPSBmaW5kQmFycmVzKGluc3RydW1lbnQsIGZyZXRBcnJheSlcbiAgcmV0dXJuIHBvd2Vyc2V0KGJhcnJlcylcblxuXG4jXG4jIEZpbmdlcmluZ3NcbiNcblxuZmluZ2VyUG9zaXRpb25zT25DaG9yZCA9IChjaG9yZCwgaW5zdHJ1bWVudCkgLT5cbiAge3Jvb3RQaXRjaCwgcGl0Y2hDbGFzc2VzfSA9IGNob3JkXG4gIHBvc2l0aW9ucyA9IFtdXG4gIGluc3RydW1lbnQuZWFjaEZpbmdlclBvc2l0aW9uIChwb3MpIC0+XG4gICAgaW50ZXJ2YWxDbGFzcyA9IGludGVydmFsQ2xhc3NEaWZmZXJlbmNlIHJvb3RQaXRjaCwgaW5zdHJ1bWVudC5waXRjaEF0KHBvcylcbiAgICBkZWdyZWVJbmRleCA9IHBpdGNoQ2xhc3Nlcy5pbmRleE9mIGludGVydmFsQ2xhc3NcbiAgICBwb3NpdGlvbnMucHVzaCBwb3MgaWYgZGVncmVlSW5kZXggPj0gMFxuICBwb3NpdGlvbnNcblxuIyBUT0RPIGFkZCBvcHRpb25zIGZvciBzdHJ1bW1pbmcgdnMuIGZpbmdlcnN0eWxlOyBtdXRpbmc7IHN0cmV0Y2hcbmNob3JkRmluZ2VyaW5ncyA9IChjaG9yZCwgaW5zdHJ1bWVudCwgb3B0aW9ucz17fSkgLT5cbiAgb3B0aW9ucyA9IF8uZXh0ZW5kIHtmaWx0ZXI6IHRydWUsIGFsbFBvc2l0aW9uczogZmFsc2V9LCBvcHRpb25zXG4gIHdhcm4gPSBmYWxzZVxuICB0aHJvdyBuZXcgRXJyb3IgXCJObyByb290IGZvciAje3V0aWwuaW5zcGVjdCBjaG9yZH1cIiB1bmxlc3MgY2hvcmQucm9vdFBpdGNoP1xuXG5cbiAgI1xuICAjIEdlbmVyYXRlXG4gICNcblxuICBmcmV0c1BlclN0cmluZyA9ICAtPlxuICAgIHBvc2l0aW9ucyA9IGZpbmdlclBvc2l0aW9uc09uQ2hvcmQoY2hvcmQsIGluc3RydW1lbnQpXG4gICAgcG9zaXRpb25zID0gKHBvcyBmb3IgcG9zIGluIHBvc2l0aW9ucyB3aGVuIHBvcy5mcmV0IDw9IDQpIHVubGVzcyBvcHRpb25zLmFsbFBvc2l0aW9uc1xuICAgIHN0cmluZ3MgPSAoW251bGxdIGZvciBzIGluIFswLi4uaW5zdHJ1bWVudC5zdHJpbmdDb3VudF0pXG4gICAgc3RyaW5nc1tzdHJpbmddLnB1c2ggZnJldCBmb3Ige3N0cmluZywgZnJldH0gaW4gcG9zaXRpb25zXG4gICAgc3RyaW5nc1xuXG4gIGNvbGxlY3RGaW5nZXJpbmdQb3NpdGlvbnMgPSAoZnJldENhbmRpZGF0ZXNQZXJTdHJpbmcpIC0+XG4gICAgc3RyaW5nQ291bnQgPSBmcmV0Q2FuZGlkYXRlc1BlclN0cmluZy5sZW5ndGhcbiAgICBwb3NpdGlvblNldCA9IFtdXG4gICAgZnJldEFycmF5ID0gW11cbiAgICBmaWxsID0gKHMpIC0+XG4gICAgICBpZiBzID09IHN0cmluZ0NvdW50XG4gICAgICAgIHBvc2l0aW9uU2V0LnB1c2ggZnJldEFycmF5LnNsaWNlKClcbiAgICAgIGVsc2VcbiAgICAgICAgZm9yIGZyZXQgaW4gZnJldENhbmRpZGF0ZXNQZXJTdHJpbmdbc11cbiAgICAgICAgICBmcmV0QXJyYXlbc10gPSBmcmV0XG4gICAgICAgICAgZmlsbCBzICsgMVxuICAgIGZpbGwgMFxuICAgIHJldHVybiBwb3NpdGlvblNldFxuXG4gIGNvbnRhaW5zQWxsQ2hvcmRQaXRjaGVzID0gKGZyZXRBcnJheSkgLT5cbiAgICBwaXRjaGVzID0gW11cbiAgICBmb3IgZnJldCwgc3RyaW5nIGluIGZyZXRBcnJheVxuICAgICAgY29udGludWUgdW5sZXNzIHR5cGVvZihmcmV0KSBpcyAnbnVtYmVyJ1xuICAgICAgcGl0Y2hDbGFzcyA9IChpbnN0cnVtZW50LnBpdGNoQXQge2ZyZXQsIHN0cmluZ30pICUgMTJcbiAgICAgIHBpdGNoZXMucHVzaCBwaXRjaENsYXNzIHVubGVzcyBwaXRjaGVzLmluZGV4T2YocGl0Y2hDbGFzcykgPj0gMFxuICAgIHJldHVybiBwaXRjaGVzLmxlbmd0aCA9PSBjaG9yZC5waXRjaENsYXNzZXMubGVuZ3RoXG5cbiAgbWF4aW11bUZyZXREaXN0YW5jZSA9IChmcmV0QXJyYXkpIC0+XG4gICAgZnJldHMgPSAoZnJldCBmb3IgZnJldCBpbiBmcmV0QXJyYXkgd2hlbiB0eXBlb2YoZnJldCkgaXMgJ251bWJlcicpXG4gICAgIyBmcmV0QXJyYXkgPSAoZnJldCBmb3IgZnJldCBpbiBmcmV0QXJyYXkgd2hlbiBmcmV0ID4gMClcbiAgICByZXR1cm4gTWF0aC5tYXgoZnJldHMuLi4pIC0gTWF0aC5taW4oZnJldHMuLi4pIDw9IDNcblxuICBnZW5lcmF0ZUZpbmdlcmluZ3MgPSAtPlxuICAgIGZpbmdlcmluZ3MgPSBbXVxuICAgIGZyZXRBcnJheXMgPSBjb2xsZWN0RmluZ2VyaW5nUG9zaXRpb25zKGZyZXRzUGVyU3RyaW5nKCkpXG4gICAgZnJldEFycmF5cyA9IGZyZXRBcnJheXMuZmlsdGVyKGNvbnRhaW5zQWxsQ2hvcmRQaXRjaGVzKVxuICAgIGZyZXRBcnJheXMgPSBmcmV0QXJyYXlzLmZpbHRlcihtYXhpbXVtRnJldERpc3RhbmNlKVxuICAgIGZvciBmcmV0QXJyYXkgaW4gZnJldEFycmF5c1xuICAgICAgcG9zaXRpb25zID0gKHtmcmV0LCBzdHJpbmd9IGZvciBmcmV0LCBzdHJpbmcgaW4gZnJldEFycmF5IHdoZW4gdHlwZW9mKGZyZXQpIGlzICdudW1iZXInKVxuICAgICAgZm9yIHBvcyBpbiBwb3NpdGlvbnNcbiAgICAgICAgcG9zLmludGVydmFsQ2xhc3MgPSBpbnRlcnZhbENsYXNzRGlmZmVyZW5jZSBjaG9yZC5yb290UGl0Y2gsIGluc3RydW1lbnQucGl0Y2hBdChwb3MpXG4gICAgICAgIHBvcy5kZWdyZWVJbmRleCA9IGNob3JkLnBpdGNoQ2xhc3Nlcy5pbmRleE9mIHBvcy5pbnRlcnZhbENsYXNzXG4gICAgICBzZXRzID0gW1tdXVxuICAgICAgc2V0cyA9IGNvbGxlY3RCYXJyZVNldHMoaW5zdHJ1bWVudCwgZnJldEFycmF5KSBpZiBwb3NpdGlvbnMubGVuZ3RoID4gNFxuICAgICAgZm9yIGJhcnJlcyBpbiBzZXRzXG4gICAgICAgIGZpbmdlcmluZ3MucHVzaCBuZXcgRmluZ2VyaW5nIHtwb3NpdGlvbnMsIGNob3JkLCBiYXJyZXMsIGluc3RydW1lbnR9XG4gICAgZmluZ2VyaW5nc1xuXG4gIGNob3JkTm90ZUNvdW50ID0gY2hvcmQucGl0Y2hDbGFzc2VzLmxlbmd0aFxuXG5cbiAgI1xuICAjIEZpbHRlcnNcbiAgI1xuXG4gIGNvdW50RGlzdGluY3ROb3RlcyA9IChmaW5nZXJpbmcpIC0+XG4gICAgIyBfLmNoYWluKGZpbmdlcmluZy5wb3NpdGlvbnMpLnBsdWNrKCdpbnRlcnZhbENsYXNzJykudW5pcSgpLnZhbHVlKCkubGVuZ3RoXG4gICAgcGl0Y2hlcyA9IFtdXG4gICAgZm9yIHtpbnRlcnZhbENsYXNzfSBpbiBmaW5nZXJpbmcucG9zaXRpb25zXG4gICAgICBwaXRjaGVzLnB1c2ggaW50ZXJ2YWxDbGFzcyB1bmxlc3MgaW50ZXJ2YWxDbGFzcyBpbiBwaXRjaGVzXG4gICAgcmV0dXJuIHBpdGNoZXMubGVuZ3RoXG5cbiAgaGFzQWxsTm90ZXMgPSAoZmluZ2VyaW5nKSAtPlxuICAgIHJldHVybiBjb3VudERpc3RpbmN0Tm90ZXMoZmluZ2VyaW5nKSA9PSBjaG9yZE5vdGVDb3VudFxuXG4gIG11dGVkTWVkaWFsU3RyaW5ncyA9IChmaW5nZXJpbmcpIC0+XG4gICAgcmV0dXJuIGZpbmdlcmluZy5mcmV0c3RyaW5nLm1hdGNoKC9cXGR4K1xcZC8pXG5cbiAgbXV0ZWRUcmVibGVTdHJpbmdzID0gKGZpbmdlcmluZykgLT5cbiAgICByZXR1cm4gZmluZ2VyaW5nLmZyZXRzdHJpbmcubWF0Y2goL3gkLylcblxuICBnZXRGaW5nZXJDb3VudCA9IChmaW5nZXJpbmcpIC0+XG4gICAgbiA9IChwb3MgZm9yIHBvcyBpbiBmaW5nZXJpbmcucG9zaXRpb25zIHdoZW4gcG9zLmZyZXQgPiAwKS5sZW5ndGhcbiAgICBuIC09IGJhcnJlLmZpbmdlclJlcGxhY2VtZW50Q291bnQgLSAxIGZvciBiYXJyZSBpbiBmaW5nZXJpbmcuYmFycmVzXG4gICAgblxuXG4gIGZvdXJGaW5nZXJzT3JGZXdlciA9IChmaW5nZXJpbmcpIC0+XG4gICAgcmV0dXJuIGdldEZpbmdlckNvdW50KGZpbmdlcmluZykgPD0gNFxuXG5cbiAgIyBDb25zdHJ1Y3QgdGhlIGZpbHRlciBzZXRcblxuICBmaWx0ZXJzID0gW11cbiAgIyBmaWx0ZXJzLnB1c2ggbmFtZTogJ2hhcyBhbGwgY2hvcmQgbm90ZXMnLCBzZWxlY3Q6IGhhc0FsbE5vdGVzXG5cbiAgaWYgb3B0aW9ucy5maWx0ZXJcbiAgICBmaWx0ZXJzLnB1c2ggbmFtZTogJ2ZvdXIgZmluZ2VycyBvciBmZXdlcicsIHNlbGVjdDogZm91ckZpbmdlcnNPckZld2VyXG5cbiAgdW5sZXNzIG9wdGlvbnMuZmluZ2VycGlja2luZ1xuICAgIGZpbHRlcnMucHVzaCBuYW1lOiAnbm8gbXV0ZWQgbWVkaWFsIHN0cmluZ3MnLCByZWplY3Q6IG11dGVkTWVkaWFsU3RyaW5nc1xuICAgIGZpbHRlcnMucHVzaCBuYW1lOiAnbm8gbXV0ZWQgdHJlYmxlIHN0cmluZ3MnLCByZWplY3Q6IG11dGVkVHJlYmxlU3RyaW5nc1xuXG4gICMgZmlsdGVyIGJ5IGFsbCB0aGUgZmlsdGVycyBpbiB0aGUgbGlzdCwgZXhjZXB0IGlnbm9yZSB0aG9zZSB0aGF0IHdvdWxkbid0IHBhc3MgYW55dGhpbmdcbiAgZmlsdGVyRmluZ2VyaW5ncyA9IChmaW5nZXJpbmdzKSAtPlxuICAgIGZvciB7bmFtZSwgc2VsZWN0LCByZWplY3R9IGluIGZpbHRlcnNcbiAgICAgIGZpbHRlcmVkID0gZmluZ2VyaW5nc1xuICAgICAgc2VsZWN0ID0gKCh4KSAtPiBub3QgcmVqZWN0KHgpKSBpZiByZWplY3RcbiAgICAgIGZpbHRlcmVkID0gZmlsdGVyZWQuZmlsdGVyKHNlbGVjdCkgaWYgc2VsZWN0XG4gICAgICB1bmxlc3MgZmlsdGVyZWQubGVuZ3RoXG4gICAgICAgIGNvbnNvbGUud2FybiBcIiN7Y2hvcmRfbmFtZX06IG5vIGZpbmdlcmluZ3MgcGFzcyBmaWx0ZXIgXFxcIiN7bmFtZX1cXFwiXCIgaWYgd2FyblxuICAgICAgICBmaWx0ZXJlZCA9IGZpbmdlcmluZ3NcbiAgICAgIGZpbmdlcmluZ3MgPSBmaWx0ZXJlZFxuICAgIHJldHVybiBmaW5nZXJpbmdzXG5cblxuICAjXG4gICMgU29ydFxuICAjXG5cbiAgIyBGSVhNRSBjb3VudCBwaXRjaCBjbGFzc2VzLCBub3Qgc291bmRlZCBzdHJpbmdzXG4gIGhpZ2hOb3RlQ291bnQgPSAoZmluZ2VyaW5nKSAtPlxuICAgIGZpbmdlcmluZy5wb3NpdGlvbnMubGVuZ3RoXG5cbiAgaXNSb290UG9zaXRpb24gPSAoZmluZ2VyaW5nKSAtPlxuICAgIF8oZmluZ2VyaW5nLnBvc2l0aW9ucykuc29ydEJ5KChwb3MpIC0+IHBvcy5zdHJpbmcpWzBdLmRlZ3JlZUluZGV4ID09IDBcblxuICByZXZlcnNlU29ydEtleSA9IChmbikgLT4gKGEpIC0+IC1mbihhKVxuXG4gICMgb3JkZXJlZCBsaXN0IG9mIHByZWZlcmVuY2VzLCBmcm9tIG1vc3QgdG8gbGVhc3QgaW1wb3J0YW50XG4gIHByZWZlcmVuY2VzID0gW1xuICAgIHtuYW1lOiAncm9vdCBwb3NpdGlvbicsIGtleTogaXNSb290UG9zaXRpb259XG4gICAge25hbWU6ICdoaWdoIG5vdGUgY291bnQnLCBrZXk6IGhpZ2hOb3RlQ291bnR9XG4gICAge25hbWU6ICdhdm9pZCBiYXJyZXMnLCBrZXk6IHJldmVyc2VTb3J0S2V5KChmaW5nZXJpbmcpIC0+IGZpbmdlcmluZy5iYXJyZXMubGVuZ3RoKX1cbiAgICB7bmFtZTogJ2xvdyBmaW5nZXIgY291bnQnLCBrZXk6IHJldmVyc2VTb3J0S2V5KGdldEZpbmdlckNvdW50KX1cbiAgXVxuXG4gIHNvcnRGaW5nZXJpbmdzID0gKGZpbmdlcmluZ3MpIC0+XG4gICAgZmluZ2VyaW5ncyA9IF8oZmluZ2VyaW5ncykuc29ydEJ5KGtleSkgZm9yIHtrZXl9IGluIHByZWZlcmVuY2VzLnNsaWNlKDApLnJldmVyc2UoKVxuICAgIGZpbmdlcmluZ3MucmV2ZXJzZSgpXG4gICAgcmV0dXJuIGZpbmdlcmluZ3NcblxuXG4gICNcbiAgIyBHZW5lcmF0ZSwgZmlsdGVyLCBhbmQgc29ydFxuICAjXG5cbiAgZmluZ2VyaW5ncyA9IGdlbmVyYXRlRmluZ2VyaW5ncygpXG4gIGZpbmdlcmluZ3MgPSBmaWx0ZXJGaW5nZXJpbmdzKGZpbmdlcmluZ3MpXG4gIGZpbmdlcmluZ3MgPSBzb3J0RmluZ2VyaW5ncyhmaW5nZXJpbmdzKVxuXG4gIHByb3BlcnRpZXMgPSB7XG4gICAgcm9vdDogaXNSb290UG9zaXRpb25cbiAgICBiYXJyZXM6IChmKSAtPiBmLmJhcnJlcy5sZW5ndGhcbiAgICBmaW5nZXJzOiBnZXRGaW5nZXJDb3VudFxuICAgIGludmVyc2lvbjogKGYpIC0+IGYuaW52ZXJzaW9uTGV0dGVyIG9yICcnXG4gICAgIyBiYXNzOiAvXlxcZHszfXgqJC9cbiAgICAjIHRyZWJsZTogL154KlxcZHszfSQvXG4gICAgc2tpcHBpbmc6IC9cXGR4K1xcZC9cbiAgICBtdXRpbmc6IC9cXGR4L1xuICAgIG9wZW46IC8wL1xuICAgIHRyaWFkOiAoe3Bvc2l0aW9uc30pIC0+IHBvc2l0aW9ucy5sZW5ndGggPT0gM1xuICAgIHBvc2l0aW9uOiAoe3Bvc2l0aW9uc30pIC0+IE1hdGgubWF4KF8ubWluKF8ucGx1Y2socG9zaXRpb25zLCAnZnJldCcpKSAtIDEsIDApXG4gICAgc3RyaW5nczogKHtwb3NpdGlvbnN9KSAtPiBwb3NpdGlvbnMubGVuZ3RoXG4gIH1cbiAgZm9yIG5hbWUsIGZuIG9mIHByb3BlcnRpZXNcbiAgICBmb3IgZmluZ2VyaW5nIGluIGZpbmdlcmluZ3NcbiAgICAgIHZhbHVlID0gaWYgZm4gaW5zdGFuY2VvZiBSZWdFeHAgdGhlbiBmbi50ZXN0KGZpbmdlcmluZy5mcmV0c3RyaW5nKSBlbHNlIGZuKGZpbmdlcmluZylcbiAgICAgIGZpbmdlcmluZy5wcm9wZXJ0aWVzW25hbWVdID0gdmFsdWVcblxuXG4gIHJldHVybiBmaW5nZXJpbmdzXG5cbmJlc3RGaW5nZXJpbmdGb3IgPSAoY2hvcmQsIGluc3RydW1lbnQpIC0+XG4gIHJldHVybiBjaG9yZEZpbmdlcmluZ3MoY2hvcmQsIGluc3RydW1lbnQpWzBdXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBiZXN0RmluZ2VyaW5nRm9yXG4gIGNob3JkRmluZ2VyaW5nc1xufVxuIiwie1xuICBGcmV0Q291bnRcbiAgRnJldE51bWJlcnNcbn0gPSByZXF1aXJlICcuL2luc3RydW1lbnRzJ1xuXG5cbiNcbiMgU3R5bGVcbiNcblxuRGVmYXVsdFN0eWxlID1cbiAgaF9ndXR0ZXI6IDEwXG4gIHZfZ3V0dGVyOiAxMFxuICBzdHJpbmdfc3BhY2luZzogMjBcbiAgZnJldF93aWR0aDogNDVcbiAgZnJldF9vdmVyaGFuZzogLjMgKiA0NVxuXG5wYWRkZWRGcmV0Ym9hcmRXaWR0aCA9IChpbnN0cnVtZW50LCBzdHlsZT1EZWZhdWx0U3R5bGUpIC0+XG4gIDIgKiBzdHlsZS52X2d1dHRlciArIHN0eWxlLmZyZXRfd2lkdGggKiBGcmV0Q291bnQgKyBzdHlsZS5mcmV0X292ZXJoYW5nXG5cbnBhZGRlZEZyZXRib2FyZEhlaWdodCA9IChpbnN0cnVtZW50LCBzdHlsZT1EZWZhdWx0U3R5bGUpIC0+XG4gIDIgKiBzdHlsZS5oX2d1dHRlciArIChpbnN0cnVtZW50LnN0cmluZ3MgLSAxKSAqIHN0eWxlLnN0cmluZ19zcGFjaW5nXG5cblxuI1xuIyBEcmF3aW5nIE1ldGhvZHNcbiNcblxuZHJhd0ZyZXRib2FyZFN0cmluZ3MgPSAoaW5zdHJ1bWVudCwgY3R4KSAtPlxuICBzdHlsZSA9IERlZmF1bHRTdHlsZVxuICBmb3Igc3RyaW5nIGluIGluc3RydW1lbnQuc3RyaW5nTnVtYmVyc1xuICAgIHkgPSBzdHJpbmcgKiBzdHlsZS5zdHJpbmdfc3BhY2luZyArIHN0eWxlLmhfZ3V0dGVyXG4gICAgY3R4LmJlZ2luUGF0aCgpXG4gICAgY3R4Lm1vdmVUbyBzdHlsZS5oX2d1dHRlciwgeVxuICAgIGN0eC5saW5lVG8gc3R5bGUuaF9ndXR0ZXIgKyBGcmV0Q291bnQgKiBzdHlsZS5mcmV0X3dpZHRoICsgc3R5bGUuZnJldF9vdmVyaGFuZywgeVxuICAgIGN0eC5saW5lV2lkdGggPSAxXG4gICAgY3R4LnN0cm9rZSgpXG5cbmRyYXdGcmV0Ym9hcmRGcmV0cyA9IChjdHgsIGluc3RydW1lbnQpIC0+XG4gIHN0eWxlID0gRGVmYXVsdFN0eWxlXG4gIGZvciBmcmV0IGluIEZyZXROdW1iZXJzXG4gICAgeCA9IHN0eWxlLmhfZ3V0dGVyICsgZnJldCAqIHN0eWxlLmZyZXRfd2lkdGhcbiAgICBjdHguYmVnaW5QYXRoKClcbiAgICBjdHgubW92ZVRvIHgsIHN0eWxlLmhfZ3V0dGVyXG4gICAgY3R4LmxpbmVUbyB4LCBzdHlsZS5oX2d1dHRlciArIChpbnN0cnVtZW50LnN0cmluZ3MgLSAxKSAqIHN0eWxlLnN0cmluZ19zcGFjaW5nXG4gICAgY3R4LmxpbmVXaWR0aCA9IDMgaWYgZnJldCA9PSAwXG4gICAgY3R4LnN0cm9rZSgpXG4gICAgY3R4LmxpbmVXaWR0aCA9IDFcblxuZHJhd0ZyZXRib2FyZEZpbmdlclBvc2l0aW9uID0gKGN0eCwgaW5zdHJ1bWVudCwgcG9zaXRpb24sIG9wdGlvbnM9e30pIC0+XG4gIHtzdHJpbmcsIGZyZXR9ID0gcG9zaXRpb25cbiAge2lzUm9vdCwgY29sb3J9ID0gb3B0aW9uc1xuICBzdHlsZSA9IERlZmF1bHRTdHlsZVxuICBjb2xvciB8fD0gaWYgaXNSb290IHRoZW4gJ3JlZCcgZWxzZSAnd2hpdGUnXG4gIHggPSBzdHlsZS5oX2d1dHRlciArIChmcmV0IC0gMC41KSAqIHN0eWxlLmZyZXRfd2lkdGhcbiAgeCA9IHN0eWxlLmhfZ3V0dGVyIGlmIGZyZXQgPT0gMFxuICB5ID0gc3R5bGUudl9ndXR0ZXIgKyAoNSAtIHN0cmluZykgKiBzdHlsZS5zdHJpbmdfc3BhY2luZ1xuICBjdHguYmVnaW5QYXRoKClcbiAgY3R4LmFyYyB4LCB5LCA3LCAwLCAyICogTWF0aC5QSSwgZmFsc2VcbiAgY3R4LmZpbGxTdHlsZSA9IGNvbG9yXG4gIGN0eC5saW5lV2lkdGggPSAyIHVubGVzcyBpc1Jvb3RcbiAgY3R4LmZpbGwoKVxuICBjdHguc3Ryb2tlKClcbiAgY3R4LnN0cm9rZVN0eWxlID0gJ2JsYWNrJ1xuICBjdHgubGluZVdpZHRoID0gMVxuXG5kcmF3RnJldGJvYXJkID0gKGN0eCwgaW5zdHJ1bWVudCwgcG9zaXRpb25zKSAtPlxuICBkcmF3RnJldGJvYXJkU3RyaW5ncyBjdHgsIGluc3RydW1lbnRcbiAgZHJhd0ZyZXRib2FyZEZyZXRzIGN0eCwgaW5zdHJ1bWVudFxuICBkcmF3RnJldGJvYXJkRmluZ2VyUG9zaXRpb24gY3R4LCBpbnN0cnVtZW50LCBwb3NpdGlvbiwgcG9zaXRpb24gZm9yIHBvc2l0aW9uIGluIChwb3NpdGlvbnMgb3IgW10pXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgZHJhdzogZHJhd0ZyZXRib2FyZFxuICBoZWlnaHQ6IHBhZGRlZEZyZXRib2FyZEhlaWdodFxuICB3aWR0aDogcGFkZGVkRnJldGJvYXJkV2lkdGhcbiIsIl8gPSByZXF1aXJlICd1bmRlcnNjb3JlJ1xue0ludGVydmFsTmFtZXN9ID0gcmVxdWlyZSAnLi90aGVvcnknXG57ZHJhd1RleHQsIHdpdGhHcmFwaGljc0NvbnRleHR9ID0gcmVxdWlyZSAnLi9sYXlvdXQnXG5DaG9yZERpYWdyYW0gPSByZXF1aXJlICcuL2Nob3JkX2RpYWdyYW0nXG5cbkRlZmF1bHRTdHlsZSA9XG4gIGludGVydmFsQ2xhc3NfY29sb3JzOiBDaG9yZERpYWdyYW0uZGVmYXVsdFN0eWxlLmludGVydmFsQ2xhc3NfY29sb3JzXG4gIHJhZGl1czogNTBcbiAgY2VudGVyOiB0cnVlXG4gIGZpbGxfY2VsbHM6IGZhbHNlXG4gIGxhYmVsX2NlbGxzOiBmYWxzZVxuXG4jIEVudW1lcmF0ZSB0aGVzZSBleHBsaWNpdGx5IGluc3RlYWQgb2YgY29tcHV0aW5nIHRoZW0sXG4jIHNvIHRoYXQgd2UgY2FuIGZpbmUtdHVuZSB0aGUgcG9zaXRpb24gb2YgY2VsbHMgdGhhdFxuIyBjb3VsZCBiZSBwbGFjZWQgYXQgb25lIG9mIHNldmVyYWwgZGlmZmVyZW50IGxvY2F0aW9ucy5cbkludGVydmFsVmVjdG9ycyA9XG4gIDI6IHtQNTogLTEsIG0zOiAtMX1cbiAgMzoge20zOiAxfVxuICA0OiB7TTM6IDF9XG4gIDU6IHtQNTogLTF9XG4gIDY6IHttMzogMn1cbiAgMTE6IHtQNTogMSwgTTM6IDF9XG5cbiMgUmV0dXJucyBhIHJlY29yZCB7bTMgTTMgUDV9IHRoYXQgcmVwcmVzZW50cyB0aGUgY2Fub25pY2FsIHZlY3RvciAoYWNjb3JkaW5nIHRvIGBJbnRlcnZhbFZlY3RvcnNgKVxuIyBvZiB0aGUgaW50ZXJ2YWwgY2xhc3MuXG5pbnRlcnZhbENsYXNzVmVjdG9ycyA9IChpbnRlcnZhbENsYXNzKSAtPlxuICBvcmlnaW5hbF9pbnRlcnZhbENsYXNzID0gaW50ZXJ2YWxDbGFzcyAjIGZvciBlcnJvciByZXBvcnRpbmdcbiAgYWRqdXN0bWVudHMgPSB7fVxuICBhZGp1c3QgPSAoZF9pYywgaW50ZXJ2YWxzKSAtPlxuICAgIGludGVydmFsQ2xhc3MgKz0gZF9pY1xuICAgIGFkanVzdG1lbnRzW2tdID89IDAgZm9yIGsgb2YgaW50ZXJ2YWxzXG4gICAgYWRqdXN0bWVudHNba10gKz0gdiBmb3IgaywgdiBvZiBpbnRlcnZhbHNcbiAgYWRqdXN0IC0yNCwgUDU6IDQsIE0zOiAtMSB3aGlsZSBpbnRlcnZhbENsYXNzID49IDI0XG4gIGFkanVzdCAtMTIsIE0zOiAzIHdoaWxlIGludGVydmFsQ2xhc3MgPj0gMTJcbiAgW3JlY29yZCwgc2lnbl0gPSBbSW50ZXJ2YWxWZWN0b3JzW2ludGVydmFsQ2xhc3NdLCAxXVxuICBbcmVjb3JkLCBzaWduXSA9IFtJbnRlcnZhbFZlY3RvcnNbMTIgLSBpbnRlcnZhbENsYXNzXSwgLTFdIHVubGVzcyByZWNvcmRcbiAgaW50ZXJ2YWxzID0gXy5leHRlbmQge20zOiAwLCBNMzogMCwgUDU6IDAsIHNpZ246IDF9LCByZWNvcmRcbiAgaW50ZXJ2YWxzW2tdICo9IHNpZ24gZm9yIGsgb2YgaW50ZXJ2YWxzXG4gIGludGVydmFsc1trXSArPSB2IGZvciBrLCB2IG9mIGFkanVzdG1lbnRzXG4gIGNvbXB1dGVkX3NlbWl0b25lcyA9ICgxMiArIGludGVydmFscy5QNSAqIDcgKyBpbnRlcnZhbHMuTTMgKiA0ICsgaW50ZXJ2YWxzLm0zICogMykgJSAxMlxuICB1bmxlc3MgY29tcHV0ZWRfc2VtaXRvbmVzID09IG9yaWdpbmFsX2ludGVydmFsQ2xhc3MgJSAxMlxuICAgIGNvbnNvbGUuZXJyb3IgXCJFcnJvciBjb21wdXRpbmcgZ3JpZCBwb3NpdGlvbiBmb3IgI3tvcmlnaW5hbF9pbnRlcnZhbENsYXNzfTpcXG5cIlxuICAgICAgLCBcIiAgI3tvcmlnaW5hbF9pbnRlcnZhbENsYXNzfSAtPlwiLCBpbnRlcnZhbHNcbiAgICAgICwgJy0+JywgY29tcHV0ZWRfc2VtaXRvbmVzXG4gICAgICAsICchPScsIG9yaWdpbmFsX2ludGVydmFsQ2xhc3MgJSAxMlxuICBpbnRlcnZhbHNcblxuZHJhd0hhcm1vbmljVGFibGUgPSAoaW50ZXJ2YWxDbGFzc2VzLCBvcHRpb25zPXt9KSAtPlxuICBvcHRpb25zID0gXy5leHRlbmQge2RyYXc6IHRydWV9LCBEZWZhdWx0U3R5bGUsIG9wdGlvbnNcbiAgY29sb3JzID0gb3B0aW9ucy5pbnRlcnZhbENsYXNzX2NvbG9yc1xuICBpbnRlcnZhbENsYXNzZXMgPSBbMF0uY29uY2F0IGludGVydmFsQ2xhc3NlcyB1bmxlc3MgMCBpbiBpbnRlcnZhbENsYXNzZXNcbiAgY2VsbF9yYWRpdXMgPSBvcHRpb25zLnJhZGl1c1xuICBoZXhfcmFkaXVzID0gY2VsbF9yYWRpdXMgLyAyXG5cbiAgY2VsbF9jZW50ZXIgPSAoaW50ZXJ2YWxfa2xhc3MpIC0+XG4gICAgdmVjdG9ycyA9IGludGVydmFsQ2xhc3NWZWN0b3JzIGludGVydmFsX2tsYXNzXG4gICAgZHkgPSB2ZWN0b3JzLlA1ICsgKHZlY3RvcnMuTTMgKyB2ZWN0b3JzLm0zKSAvIDJcbiAgICBkeCA9IHZlY3RvcnMuTTMgLSB2ZWN0b3JzLm0zXG4gICAgeCA9IGR4ICogY2VsbF9yYWRpdXMgKiAuOFxuICAgIHkgPSAtZHkgKiBjZWxsX3JhZGl1cyAqIC45NVxuICAgIHt4LCB5fVxuXG4gIGJvdW5kcyA9IHtsZWZ0OiBJbmZpbml0eSwgdG9wOiBJbmZpbml0eSwgcmlnaHQ6IC1JbmZpbml0eSwgYm90dG9tOiAtSW5maW5pdHl9XG4gIGZvciBpbnRlcnZhbF9rbGFzcyBpbiBpbnRlcnZhbENsYXNzZXNcbiAgICB7eCwgeX0gPSBjZWxsX2NlbnRlciBpbnRlcnZhbF9rbGFzc1xuICAgIGJvdW5kcy5sZWZ0ID0gTWF0aC5taW4gYm91bmRzLmxlZnQsIHggLSBoZXhfcmFkaXVzXG4gICAgYm91bmRzLnRvcCA9IE1hdGgubWluIGJvdW5kcy50b3AsIHkgLSBoZXhfcmFkaXVzXG4gICAgYm91bmRzLnJpZ2h0ID0gTWF0aC5tYXggYm91bmRzLnJpZ2h0LCB4ICsgaGV4X3JhZGl1c1xuICAgIGJvdW5kcy5ib3R0b20gPSBNYXRoLm1heCBib3VuZHMuYm90dG9tLCB5ICsgaGV4X3JhZGl1c1xuXG4gIHJldHVybiB7d2lkdGg6IGJvdW5kcy5yaWdodCAtIGJvdW5kcy5sZWZ0LCBoZWlnaHQ6IGJvdW5kcy5ib3R0b20gLSBib3VuZHMudG9wfSB1bmxlc3Mgb3B0aW9ucy5kcmF3XG5cbiAgd2l0aEdyYXBoaWNzQ29udGV4dCAoY3R4KSAtPlxuICAgIGN0eC50cmFuc2xhdGUgLWJvdW5kcy5sZWZ0LCAtYm91bmRzLmJvdHRvbVxuXG4gICAgZm9yIGludGVydmFsX2tsYXNzIGluIGludGVydmFsQ2xhc3Nlc1xuICAgICAgaXNSb290ID0gaW50ZXJ2YWxfa2xhc3MgPT0gMFxuICAgICAgY29sb3IgPSBjb2xvcnNbaW50ZXJ2YWxfa2xhc3MgJSAxMl1cbiAgICAgIGNvbG9yIHx8PSBjb2xvcnNbMTIgLSBpbnRlcnZhbF9rbGFzc11cbiAgICAgIGN0eC5iZWdpblBhdGgoKVxuICAgICAge3gsIHl9ID0gY2VsbF9jZW50ZXIgaW50ZXJ2YWxfa2xhc3NcblxuICAgICAgIyBmcmFtZVxuICAgICAgZm9yIGkgaW4gWzAuLjZdXG4gICAgICAgIGEgPSBpICogTWF0aC5QSSAvIDNcbiAgICAgICAgcG9zID0gW3ggKyBoZXhfcmFkaXVzICogTWF0aC5jb3MoYSksIHkgKyBoZXhfcmFkaXVzICogTWF0aC5zaW4oYSldXG4gICAgICAgIGN0eC5tb3ZlVG8gcG9zLi4uIGlmIGkgPT0gMFxuICAgICAgICBjdHgubGluZVRvIHBvcy4uLlxuICAgICAgY3R4LnN0cm9rZVN0eWxlID0gJ2dyYXknXG4gICAgICBjdHguc3Ryb2tlKClcblxuICAgICAgIyBmaWxsXG4gICAgICBpZiBpc1Jvb3Qgb3IgKG9wdGlvbnMuZmlsbF9jZWxscyBhbmQgaW50ZXJ2YWxfa2xhc3MgPCAxMilcbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9IGNvbG9yIG9yICdyZ2JhKDI1NSwwLDAsMC4xNSknXG4gICAgICAgIGN0eC5nbG9iYWxBbHBoYSA9IDAuMyB1bmxlc3MgaXNSb290XG4gICAgICAgIGN0eC5maWxsKClcbiAgICAgICAgY3R4Lmdsb2JhbEFscGhhID0gMVxuXG4gICAgICBjb250aW51ZSBpZiBpc1Jvb3Qgb3Igb3B0aW9ucy5maWxsX2NlbGxzXG5cbiAgICAgICMgZmlsbFxuICAgICAgY3R4Lmdsb2JhbEFscGhhID0gMC4zIGlmIG9wdGlvbnMubGFiZWxfY2VsbHNcbiAgICAgIGRvIC0+XG4gICAgICAgIFtkeCwgZHksIGRuXSA9IFsteSwgeCwgMiAvIE1hdGguc3FydCh4KnggKyB5KnkpXVxuICAgICAgICBkeCAqPSBkblxuICAgICAgICBkeSAqPSBkblxuICAgICAgICBjdHguYmVnaW5QYXRoKClcbiAgICAgICAgY3R4Lm1vdmVUbyAwLCAwXG4gICAgICAgIGN0eC5saW5lVG8geCArIGR4LCB5ICsgZHlcbiAgICAgICAgY3R4LmxpbmVUbyB4IC0gZHgsIHkgLSBkeVxuICAgICAgICBjdHguZmlsbFN0eWxlID0gY29sb3JcbiAgICAgICAgY3R4LmZpbGwoKVxuXG4gICAgICBjdHguYmVnaW5QYXRoKClcbiAgICAgIGN0eC5hcmMgeCwgeSwgMiwgMCwgMiAqIE1hdGguUEksIGZhbHNlXG4gICAgICBjdHguZmlsbFN0eWxlID0gY29sb3JcbiAgICAgIGN0eC5maWxsKClcbiAgICAgIGN0eC5nbG9iYWxBbHBoYSA9IDFcblxuICAgIGN0eC5iZWdpblBhdGgoKVxuICAgIGN0eC5hcmMgMCwgMCwgMi41LCAwLCAyICogTWF0aC5QSSwgZmFsc2VcbiAgICBjdHguZmlsbFN0eWxlID0gJ3JlZCdcbiAgICBjdHguZmlsbCgpXG5cbiAgICBpZiBvcHRpb25zLmxhYmVsX2NlbGxzXG4gICAgICBmb3IgaW50ZXJ2YWxfa2xhc3MgaW4gaW50ZXJ2YWxDbGFzc2VzXG4gICAgICAgIGxhYmVsID0gSW50ZXJ2YWxOYW1lc1tpbnRlcnZhbF9rbGFzc11cbiAgICAgICAgbGFiZWwgPSAnUicgaWYgaW50ZXJ2YWxfa2xhc3MgPT0gMFxuICAgICAgICB7eCwgeX0gPSBjZWxsX2NlbnRlciBpbnRlcnZhbF9rbGFzc1xuICAgICAgICBkcmF3VGV4dCBsYWJlbCwgZm9udDogJzEwcHQgVGltZXMnLCBmaWxsU3R5bGU6ICdibGFjaycsIHg6IHgsIHk6IHksIGdyYXZpdHk6ICdjZW50ZXInXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBkcmF3OiBkcmF3SGFybW9uaWNUYWJsZVxufVxuIiwie2ludGVydmFsQ2xhc3NEaWZmZXJlbmNlLCBwaXRjaEZyb21TY2llbnRpZmljTm90YXRpb259ID0gcmVxdWlyZSgnLi90aGVvcnknKVxuXG4jXG4jIEZyZXRib2FyZFxuI1xuXG5jbGFzcyBJbnN0cnVtZW50XG4gIHN0cmluZ0NvdW50OiA2XG4gIHN0cmluZ3M6IDZcbiAgZnJldENvdW50OiAxMlxuICBzdHJpbmdOdW1iZXJzOiBbMC4uNV1cbiAgc3RyaW5nUGl0Y2hlczogJ0U0IEIzIEczIEQzIEEyIEUyJy5zcGxpdCgvXFxzLykucmV2ZXJzZSgpLm1hcCBwaXRjaEZyb21TY2llbnRpZmljTm90YXRpb25cblxuICBlYWNoRmluZ2VyUG9zaXRpb246IChmbikgLT5cbiAgICBmb3Igc3RyaW5nIGluIEBzdHJpbmdOdW1iZXJzXG4gICAgICBmb3IgZnJldCBpbiBbMC4uQGZyZXRDb3VudF1cbiAgICAgICAgZm4gc3RyaW5nOiBzdHJpbmcsIGZyZXQ6IGZyZXRcblxuICBwaXRjaEF0OiAoe3N0cmluZywgZnJldH0pIC0+XG4gICAgQHN0cmluZ1BpdGNoZXNbc3RyaW5nXSArIGZyZXRcblxuRnJldE51bWJlcnMgPSBbMC4uNF0gICMgaW5jbHVkZXMgbnV0XG5GcmV0Q291bnQgPSBGcmV0TnVtYmVycy5sZW5ndGggLSAxICAjIGRvZXNuJ3QgaW5jbHVkZSBudXRcblxuaW50ZXJ2YWxQb3NpdGlvbnNGcm9tUm9vdCA9IChpbnN0cnVtZW50LCByb290UG9zaXRpb24sIHNlbWl0b25lcykgLT5cbiAgcm9vdFBpdGNoID0gaW5zdHJ1bWVudC5waXRjaEF0KHJvb3RQb3NpdGlvbilcbiAgcG9zaXRpb25zID0gW11cbiAgZnJldGJvYXJkX3Bvc2l0aW9uc19lYWNoIChmaW5nZXJQb3NpdGlvbikgLT5cbiAgICByZXR1cm4gdW5sZXNzIGludGVydmFsQ2xhc3NEaWZmZXJlbmNlKHJvb3RQaXRjaCwgaW5zdHJ1bWVudC5waXRjaEF0KGZpbmdlclBvc2l0aW9uKSkgPT0gc2VtaXRvbmVzXG4gICAgcG9zaXRpb25zLnB1c2ggZmluZ2VyUG9zaXRpb25cbiAgcmV0dXJuIHBvc2l0aW9uc1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgRGVmYXVsdDogbmV3IEluc3RydW1lbnRcbiAgRnJldE51bWJlcnNcbiAgRnJldENvdW50XG4gIGludGVydmFsUG9zaXRpb25zRnJvbVJvb3Rcbn1cbiIsIkNvbnRleHQgPVxuICBjYW52YXM6IG51bGxcblxuZHJhd1RleHQgPSAodGV4dCwgb3B0aW9ucz17fSkgLT5cbiAgY3R4ID0gQ29udGV4dC5jdHhcbiAgb3B0aW9ucyA9IHRleHQgaWYgXy5pc09iamVjdCB0ZXh0XG4gIHtmb250LCBmaWxsU3R5bGUsIHgsIHksIGdyYXZpdHksIHdpZHRofSA9IG9wdGlvbnNcbiAgZ3Jhdml0eSB8fD0gJydcbiAgaWYgb3B0aW9ucy5jaG9pY2VzXG4gICAgZm9yIGNob2ljZSBpbiBvcHRpb25zLmNob2ljZXNcbiAgICAgIHRleHQgPSBjaG9pY2UgaWYgXy5pc1N0cmluZyBjaG9pY2VcbiAgICAgIHtmb250fSA9IGNob2ljZSBpZiBfLmlzT2JqZWN0IGNob2ljZVxuICAgICAgYnJlYWsgaWYgbWVhc3VyZV90ZXh0KHRleHQsIGZvbnQ6IGZvbnQpLndpZHRoIDw9IG9wdGlvbnMud2lkdGhcbiAgY3R4LmZvbnQgPSBmb250IGlmIGZvbnRcbiAgY3R4LmZpbGxTdHlsZSA9IGZpbGxTdHlsZSBpZiBmaWxsU3R5bGVcbiAgbSA9IGN0eC5tZWFzdXJlVGV4dCB0ZXh0XG4gIHggfHw9IDBcbiAgeSB8fD0gMFxuICB4IC09IG0ud2lkdGggLyAyIGlmIGdyYXZpdHkubWF0Y2goL14odG9wfGNlbnRlcnxtaWRkbGV8Y2VudGVyYm90dG9tKSQvaSlcbiAgeCAtPSBtLndpZHRoIGlmIGdyYXZpdHkubWF0Y2goL14ocmlnaHR8dG9wUmlnaHR8Ym90UmlnaHQpJC9pKVxuICB5IC09IG0uZW1IZWlnaHREZXNjZW50IGlmIGdyYXZpdHkubWF0Y2goL14oYm90dG9tfGJvdExlZnR8Ym90UmlnaHQpJC9pKVxuICB5ICs9IG0uZW1IZWlnaHRBc2NlbnQgaWYgZ3Jhdml0eS5tYXRjaCgvXih0b3B8dG9wTGVmdHx0b3BSaWdodCkkL2kpXG4gIGN0eC5maWxsVGV4dCB0ZXh0LCB4LCB5XG5cbndpdGhDYW52YXMgPSAoY2FudmFzLCBjYikgLT5cbiAgc2F2ZWRDYW52YXMgPSBDb250ZXh0LmNhbnZhc1xuICB0cnlcbiAgICBDb250ZXh0LmNhbnZhcyA9IGNhbnZhc1xuICAgIHJldHVybiBjYigpXG4gIGZpbmFsbHlcbiAgICBDb250ZXh0LmNhbnZhcyA9IHNhdmVkQ2FudmFzXG5cbndpdGhHcmFwaGljc0NvbnRleHQgPSAoY2IpIC0+XG4gIGN0eCA9IENvbnRleHQuY3R4XG4gIGN0eC5zYXZlKClcbiAgdHJ5XG4gICAgcmV0dXJuIGNiKGN0eClcbiAgZmluYWxseVxuICAgIGN0eC5yZXN0b3JlKClcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHdpdGhDYW52YXNcbiAgd2l0aEdyYXBoaWNzQ29udGV4dFxufVxuIiwie1BJLCBjb3MsIHNpbiwgbWluLCBtYXh9ID0gTWF0aFxuQ2hvcmREaWFncmFtU3R5bGUgPSByZXF1aXJlKCcuL2Nob3JkX2RpYWdyYW0nKS5kZWZhdWx0U3R5bGVcblxuZHJhd19waXRjaF9kaWFncmFtID0gKGN0eCwgcGl0Y2hDbGFzc2VzLCBvcHRpb25zPXtkcmF3OiB0cnVlfSkgLT5cbiAge3BpdGNoX2NvbG9ycywgcGl0Y2hfbmFtZXN9ID0gb3B0aW9uc1xuICBwaXRjaF9jb2xvcnMgfHw9IENob3JkRGlhZ3JhbVN0eWxlLmludGVydmFsX2NsYXNzX2NvbG9yc1xuICBwaXRjaF9uYW1lcyB8fD0gJ1IgbTIgTTIgbTMgTTMgUDQgVFQgUDUgbTYgTTYgbTcgTTcnLnNwbGl0KC9cXHMvKVxuICAjIHBpdGNoX25hbWVzID0gJzEgMmIgMiAzYiAzIDQgVCA1IDZiIDYgN2IgNycuc3BsaXQoL1xccy8pXG4gIHIgPSAxMFxuICByX2xhYmVsID0gciArIDdcblxuICBwaXRjaF9jbGFzc19hbmdsZSA9IChwaXRjaENsYXNzKSAtPlxuICAgIChwaXRjaENsYXNzIC0gMykgKiAyICogUEkgLyAxMlxuXG4gIGJvdW5kcyA9IHtsZWZ0OiAwLCB0b3A6IDAsIHJpZ2h0OiAwLCBib3R0b206IDB9XG4gIGV4dGVuZF9ib3VuZHMgPSAobGVmdCwgdG9wLCBib3R0b20sIHJpZ2h0KSAtPlxuICAgICMgcmlnaHQgPz0gbGVmdFxuICAgICMgYm90dG9tID89IHRvcFxuICAgIGJvdW5kcy5sZWZ0ID0gbWluIGJvdW5kcy5sZWZ0LCBsZWZ0XG4gICAgYm91bmRzLnRvcCA9IG1pbiBib3VuZHMudG9wLCB0b3BcbiAgICBib3VuZHMucmlnaHQgPSBtYXggYm91bmRzLnJpZ2h0LCByaWdodCA/IGxlZnRcbiAgICBib3VuZHMuYm90dG9tID0gbWF4IGJvdW5kcy5ib3R0b20sIGJvdHRvbSA/IHRvcFxuXG4gIGZvciBwaXRjaENsYXNzIGluIHBpdGNoQ2xhc3Nlc1xuICAgIGFuZ2xlID0gcGl0Y2hfY2xhc3NfYW5nbGUgcGl0Y2hDbGFzc1xuICAgIHggPSByICogY29zKGFuZ2xlKVxuICAgIHkgPSByICogc2luKGFuZ2xlKVxuXG4gICAgaWYgb3B0aW9ucy5kcmF3XG4gICAgICBjdHguYmVnaW5QYXRoKClcbiAgICAgIGN0eC5tb3ZlVG8gMCwgMFxuICAgICAgY3R4LmxpbmVUbyB4LCB5XG4gICAgICBjdHguc3Ryb2tlKClcbiAgICBleHRlbmRfYm91bmRzIHgsIHlcblxuICAgIGlmIG9wdGlvbnMuZHJhd1xuICAgICAgY3R4LmJlZ2luUGF0aCgpXG4gICAgICBjdHguYXJjIHgsIHksIDIsIDAsIDIgKiBQSSwgZmFsc2VcbiAgICAgIGN0eC5maWxsU3R5bGUgPSBwaXRjaF9jb2xvcnNbcGl0Y2hDbGFzc10gb3IgJ2JsYWNrJ1xuICAgICAgY3R4LmZpbGwoKVxuXG4gIGN0eC5mb250ID0gJzRwdCBUaW1lcydcbiAgY3R4LmZpbGxTdHlsZSA9ICdibGFjaydcbiAgZm9yIGNsYXNzX25hbWUsIHBpdGNoQ2xhc3MgaW4gcGl0Y2hfbmFtZXNcbiAgICBhbmdsZSA9IHBpdGNoX2NsYXNzX2FuZ2xlIHBpdGNoQ2xhc3NcbiAgICBtID0gY3R4Lm1lYXN1cmVUZXh0IGNsYXNzX25hbWVcbiAgICB4ID0gcl9sYWJlbCAqIGNvcyhhbmdsZSkgLSBtLndpZHRoIC8gMlxuICAgIHkgPSByX2xhYmVsICogc2luKGFuZ2xlKSArIG0uZW1IZWlnaHREZXNjZW50XG4gICAgY3R4LmZpbGxUZXh0IGNsYXNzX25hbWUsIHgsIHkgaWYgb3B0aW9ucy5kcmF3XG4gICAgYm91bmRzLmxlZnQgPSBtaW4gYm91bmRzLmxlZnQsIHhcbiAgICBib3VuZHMucmlnaHQgPSBtYXggYm91bmRzLnJpZ2h0LCB4ICsgbS53aWR0aFxuICAgIGJvdW5kcy50b3AgPSBtaW4gYm91bmRzLnRvcCwgeSAtIG0uZW1IZWlnaHRBc2NlbnRcbiAgICBib3VuZHMuYm90dG9tID0gbWF4IGJvdW5kcy5ib3R0b20sIHkgKyBtLmVtSGVpZ2h0QXNjZW50XG5cbiAgcmV0dXJuIGJvdW5kc1xuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIGRyYXc6IGRyYXdfcGl0Y2hfZGlhZ3JhbVxuIiwiI1xuIyBOb3RlcyBhbmQgUGl0Y2hlc1xuI1xuXG5TaGFycE5vdGVOYW1lcyA9ICdDIEMjIEQgRCMgRSBGIEYjIEcgRyMgQSBBIyBCJy5yZXBsYWNlKC8jL2csICdcXHUyNjZGJykuc3BsaXQoL1xccy8pXG5GbGF0Tm90ZU5hbWVzID0gJ0MgRGIgRCBFYiBFIEYgR2IgRyBBYiBBIEJiIEInLnJlcGxhY2UoL2IvZywgJ1xcdTI2NkQnKS5zcGxpdCgvXFxzLylcbk5vdGVOYW1lcyA9IFNoYXJwTm90ZU5hbWVzXG5cbkFjY2lkZW50YWxWYWx1ZXMgPVxuICAnIyc6IDFcbiAgJ+KZryc6IDFcbiAgJ2InOiAtMVxuICAn4pmtJzogLTFcbiAgJ/CdhKonOiAyXG4gICfwnYSrJzogLTJcblxuSW50ZXJ2YWxOYW1lcyA9IFsnUDEnLCAnbTInLCAnTTInLCAnbTMnLCAnTTMnLCAnUDQnLCAnVFQnLCAnUDUnLCAnbTYnLCAnTTYnLCAnbTcnLCAnTTcnLCAnUDgnXVxuXG5Mb25nSW50ZXJ2YWxOYW1lcyA9IFtcbiAgJ1VuaXNvbicsICdNaW5vciAybmQnLCAnTWFqb3IgMm5kJywgJ01pbm9yIDNyZCcsICdNYWpvciAzcmQnLCAnUGVyZmVjdCA0dGgnLFxuICAnVHJpdG9uZScsICdQZXJmZWN0IDV0aCcsICdNaW5vciA2dGgnLCAnTWFqb3IgNnRoJywgJ01pbm9yIDd0aCcsICdNYWpvciA3dGgnLCAnT2N0YXZlJ11cblxuZ2V0UGl0Y2hDbGFzc05hbWUgPSAocGl0Y2hDbGFzcykgLT5cbiAgTm90ZU5hbWVzW25vcm1hbGl6ZVBpdGNoQ2xhc3MocGl0Y2hDbGFzcyldXG5cbmdldFBpdGNoTmFtZSA9IChwaXRjaCkgLT5cbiAgcmV0dXJuIHBpdGNoIGlmIHR5cGVvZiBwaXRjaCA9PSAnc3RyaW5nJ1xuICBnZXRQaXRjaENsYXNzTmFtZShwaXRjaClcblxuIyBUaGUgaW50ZXJ2YWwgY2xhc3MgKGludGVnZXIgaW4gWzAuLi4xMl0pIGJldHdlZW4gdHdvIHBpdGNoIGNsYXNzIG51bWJlcnNcbmludGVydmFsQ2xhc3NEaWZmZXJlbmNlID0gKHBjYSwgcGNiKSAtPlxuICBub3JtYWxpemVQaXRjaENsYXNzKHBjYiAtIHBjYSlcblxubm9ybWFsaXplUGl0Y2hDbGFzcyA9IChwaXRjaENsYXNzKSAtPlxuICAoKHBpdGNoQ2xhc3MgJSAxMikgKyAxMikgJSAxMlxuXG5waXRjaEZyb21TY2llbnRpZmljTm90YXRpb24gPSAobmFtZSkgLT5cbiAgbWF0Y2ggPSBuYW1lLm1hdGNoKC9eKFtBLUddKShbI+KZr2Lima3wnYSq8J2Eq10qKShcXGQrKSQvaSlcbiAgdGhyb3cgbmV3IEVycm9yKFwiI3tuYW1lfSBpcyBub3QgaW4gc2NpZW50aWZpYyBub3RhdGlvblwiKSB1bmxlc3MgbWF0Y2hcbiAgW25hdHVyYWxOYW1lLCBhY2NpZGVudGFscywgb2N0YXZlXSA9IG1hdGNoWzEuLi5dXG4gIHBpdGNoID0gU2hhcnBOb3RlTmFtZXMuaW5kZXhPZihuYXR1cmFsTmFtZS50b1VwcGVyQ2FzZSgpKSArIDEyICogKDEgKyBOdW1iZXIob2N0YXZlKSlcbiAgcGl0Y2ggKz0gQWNjaWRlbnRhbFZhbHVlc1tjXSBmb3IgYyBpbiBhY2NpZGVudGFsc1xuICByZXR1cm4gcGl0Y2hcblxucGFyc2VQaXRjaENsYXNzID0gKG5hbWUpIC0+XG4gIG1hdGNoID0gbmFtZS5tYXRjaCgvXihbQS1HXSkoWyPima9i4pmt8J2EqvCdhKtdKikkL2kpXG4gIHRocm93IG5ldyBFcnJvcihcIiN7bmFtZX0gaXMgbm90IGEgcGl0Y2ggY2xhc3MgbmFtZVwiKSB1bmxlc3MgbWF0Y2hcbiAgW25hdHVyYWxOYW1lLCBhY2NpZGVudGFsc10gPSBtYXRjaFsxLi4uXVxuICBwaXRjaCA9IFNoYXJwTm90ZU5hbWVzLmluZGV4T2YobmF0dXJhbE5hbWUudG9VcHBlckNhc2UoKSlcbiAgcGl0Y2ggKz0gQWNjaWRlbnRhbFZhbHVlc1tjXSBmb3IgYyBpbiBhY2NpZGVudGFsc1xuICByZXR1cm4gcGl0Y2hcblxuXG4jXG4jIFNjYWxlc1xuI1xuXG5jbGFzcyBTY2FsZVxuICBjb25zdHJ1Y3RvcjogKHtAbmFtZSwgQHBpdGNoZXMsIEB0b25pY05hbWV9KSAtPlxuICAgIEB0b25pY1BpdGNoIG9yPSBwYXJzZVBpdGNoQ2xhc3MoQHRvbmljTmFtZSkgaWYgQHRvbmljTmFtZVxuXG4gIGF0OiAodG9uaWNOYW1lKSAtPlxuICAgIG5ldyBTY2FsZVxuICAgICAgbmFtZTogQG5hbWVcbiAgICAgIHBpdGNoZXM6IEBwaXRjaGVzXG4gICAgICB0b25pY05hbWU6IHRvbmljTmFtZVxuXG4gIGNob3JkczogKG9wdGlvbnM9e30pIC0+XG4gICAgdGhyb3cgbmV3IEVycm9yKFwib25seSBpbXBsZW1lbnRlZCBmb3Igc2NhbGVzIHdpdGggdG9uaWNzXCIpIHVubGVzcyBAdG9uaWNQaXRjaD9cbiAgICBub3RlTmFtZXMgPSBTaGFycE5vdGVOYW1lc1xuICAgIG5vdGVOYW1lcyA9IEZsYXROb3RlTmFtZXMgaWYgbm90ZU5hbWVzLmluZGV4T2YoQHRvbmljTmFtZSkgPCAwIG9yIEB0b25pY05hbWUgPT0gJ0YnXG4gICAgZGVncmVlcyA9IFswLCAyLCA0XVxuICAgIGRlZ3JlZXMucHVzaCA2IGlmIG9wdGlvbnMuc2V2ZW50aHNcbiAgICBmb3IgaSBpbiBbMC4uLkBwaXRjaGVzLmxlbmd0aF1cbiAgICAgIHBpdGNoZXMgPSBAcGl0Y2hlc1tpLi5dLmNvbmNhdChAcGl0Y2hlc1suLi5pXSlcbiAgICAgIHBpdGNoZXMgPSAocGl0Y2hlc1tkZWdyZWVdIGZvciBkZWdyZWUgaW4gZGVncmVlcykubWFwIChuKSA9PiAobiArIEB0b25pY1BpdGNoKSAlIDEyXG4gICAgICBDaG9yZC5mcm9tUGl0Y2hlcyhwaXRjaGVzKS5lbmhhcm1vbmljaXplVG8obm90ZU5hbWVzKVxuXG4gIEBmaW5kOiAodG9uaWNOYW1lKSAtPlxuICAgIHNjYWxlTmFtZSA9ICdEaWF0b25pYyBNYWpvcidcbiAgICBTY2FsZXNbc2NhbGVOYW1lXS5hdCh0b25pY05hbWUpXG5cblNjYWxlcyA9IGRvIC0+XG4gIHNjYWxlX3NwZWNzID0gW1xuICAgICdEaWF0b25pYyBNYWpvcjogMDI0NTc5ZSdcbiAgICAnTmF0dXJhbCBNaW5vcjogMDIzNTc4dCdcbiAgICAnTWVsb2RpYyBNaW5vcjogMDIzNTc5ZSdcbiAgICAnSGFybW9uaWMgTWlub3I6IDAyMzU3OGUnXG4gICAgJ1BlbnRhdG9uaWMgTWFqb3I6IDAyNDc5J1xuICAgICdQZW50YXRvbmljIE1pbm9yOiAwMzU3dCdcbiAgICAnQmx1ZXM6IDAzNTY3dCdcbiAgICAnRnJleWdpc2g6IDAxNDU3OHQnXG4gICAgJ1dob2xlIFRvbmU6IDAyNDY4dCdcbiAgICAjICdPY3RhdG9uaWMnIGlzIHRoZSBjbGFzc2ljYWwgbmFtZS4gSXQncyB0aGUgamF6eiAnRGltaW5pc2hlZCcgc2NhbGUuXG4gICAgJ09jdGF0b25pYzogMDIzNTY4OWUnXG4gIF1cbiAgZm9yIHNwZWMgaW4gc2NhbGVfc3BlY3NcbiAgICBbbmFtZSwgcGl0Y2hlc10gPSBzcGVjLnNwbGl0KC86XFxzKi8sIDIpXG4gICAgcGl0Y2hlcyA9IHBpdGNoZXMubWF0Y2goLy4vZykubWFwIChjKSAtPiB7J3QnOjEwLCAnZSc6MTF9W2NdIG9yIE51bWJlcihjKVxuICAgIG5ldyBTY2FsZSB7bmFtZSwgcGl0Y2hlc31cblxuZG8gLT5cbiAgU2NhbGVzW3NjYWxlLm5hbWVdID0gc2NhbGUgZm9yIHNjYWxlIGluIFNjYWxlc1xuXG5Nb2RlcyA9IGRvIC0+XG4gIHJvb3RUb25lcyA9IFNjYWxlc1snRGlhdG9uaWMgTWFqb3InXS5waXRjaGVzXG4gIG1vZGVOYW1lcyA9ICdJb25pYW4gRG9yaWFuIFBocnlnaWFuIEx5ZGlhbiBNaXhvbHlkaWFuIEFlb2xpYW4gTG9jcmlhbicuc3BsaXQoL1xccy8pXG4gIGZvciBkZWx0YSwgaSBpbiByb290VG9uZXNcbiAgICBuYW1lID0gbW9kZU5hbWVzW2ldXG4gICAgcGl0Y2hlcyA9ICgoZCAtIGRlbHRhICsgMTIpICUgMTIgZm9yIGQgaW4gcm9vdFRvbmVzW2kuLi5dLmNvbmNhdCByb290VG9uZXNbLi4uaV0pXG4gICAgbmV3IFNjYWxlIHtuYW1lLCBwaXRjaGVzfVxuXG5kbyAtPlxuICBNb2Rlc1ttb2RlLm5hbWVdID0gbW9kZSBmb3IgbW9kZSBpbiBNb2Rlc1xuXG4jIEluZGV4ZWQgYnkgc2NhbGUgZGVncmVlXG5GdW5jdGlvbnMgPSAnVG9uaWMgU3VwZXJ0b25pYyBNZWRpYW50IFN1YmRvbWluYW50IERvbWluYW50IFN1Ym1lZGlhbnQgU3VidG9uaWMgTGVhZGluZycuc3BsaXQoL1xccy8pXG5cbnBhcnNlQ2hvcmROdW1lcmFsID0gKG5hbWUpIC0+XG4gIGNob3JkID0ge1xuICAgIGRlZ3JlZTogJ2kgaWkgaWlpIGl2IHYgdmkgdmlpJy5pbmRleE9mKG5hbWUubWF0Y2goL1tpditdL2kpWzFdKSArIDFcbiAgICBtYWpvcjogbmFtZSA9PSBuYW1lLnRvVXBwZXJDYXNlKClcbiAgICBmbGF0OiBuYW1lLm1hdGNoKC9eYi8pXG4gICAgZGltaW5pc2hlZDogbmFtZS5tYXRjaCgvwrAvKVxuICAgIGF1Z21lbnRlZDogbmFtZS5tYXRjaCgvXFwrLylcbiAgfVxuICByZXR1cm4gY2hvcmRcblxuRnVuY3Rpb25RdWFsaXRpZXMgPVxuICBtYWpvcjogJ0kgaWkgaWlpIElWIFYgdmkgdmlpwrAnLnNwbGl0KC9cXHMvKS5tYXAgcGFyc2VDaG9yZE51bWVyYWxcbiAgbWlub3I6ICdpIGlpwrAgYklJSSBpdiB2IGJWSSBiVklJJy5zcGxpdCgvXFxzLykubWFwIHBhcnNlQ2hvcmROdW1lcmFsXG5cblxuI1xuIyBDaG9yZHNcbiNcblxuY2xhc3MgQ2hvcmRcbiAgY29uc3RydWN0b3I6ICh7QG5hbWUsIEBmdWxsTmFtZSwgQGFiYnIsIEBhYmJycywgQHBpdGNoQ2xhc3NlcywgQHJvb3ROYW1lLCBAcm9vdFBpdGNofSkgLT5cbiAgICBAYWJicnMgPz0gW0BhYmJyXVxuICAgIEBhYmJycyA9IEBhYmJycy5zcGxpdCgvcy8pIGlmIHR5cGVvZiBAYWJicnMgPT0gJ3N0cmluZydcbiAgICBAYWJiciA/PSBAYWJicnNbMF1cbiAgICBpZiBAcm9vdFBpdGNoP1xuICAgICAgQHJvb3ROYW1lIG9yPSBOb3RlTmFtZXNbQHJvb3RQaXRjaF1cbiAgICBpZiBAcm9vdE5hbWU/XG4gICAgICBAcm9vdFBpdGNoID89IHBhcnNlUGl0Y2hDbGFzcyhAcm9vdE5hbWUpXG4gICAgICByb290bGVzc0FiYnIgPSBAYWJiclxuICAgICAgcm9vdGxlc3NGdWxsTmFtZSA9IEBmdWxsTmFtZVxuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5IHRoaXMsICduYW1lJywgZ2V0OiAtPiBcIiN7QHJvb3ROYW1lfSN7cm9vdGxlc3NBYmJyfVwiXG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkgdGhpcywgJ2Z1bGxOYW1lJywgZ2V0OiAtPiBcIiN7QHJvb3ROYW1lfSAje3Jvb3RsZXNzRnVsbE5hbWV9XCJcbiAgICBkZWdyZWVzID0gKDEgKyAyICogaSBmb3IgaSBpbiBbMC4uQHBpdGNoQ2xhc3Nlcy5sZW5ndGhdKVxuICAgIGRlZ3JlZXNbMV0gPSB7J1N1czInOjIsICdTdXM0Jzo0fVtAbmFtZV0gfHwgZGVncmVlc1sxXVxuICAgIGRlZ3JlZXNbM10gPSA2IGlmIEBuYW1lLm1hdGNoIC82L1xuICAgIEBjb21wb25lbnRzID0gZm9yIHBjLCBwY2kgaW4gQHBpdGNoQ2xhc3Nlc1xuICAgICAgbmFtZSA9IEludGVydmFsTmFtZXNbcGNdXG4gICAgICBkZWdyZWUgPSBkZWdyZWVzW3BjaV1cbiAgICAgIGlmIHBjID09IDBcbiAgICAgICAgbmFtZSA9ICdSJ1xuICAgICAgZWxzZSB1bmxlc3MgTnVtYmVyKG5hbWUubWF0Y2goL1xcZCsvKT9bMF0pID09IGRlZ3JlZVxuICAgICAgICBuYW1lID0gXCJBI3tkZWdyZWV9XCIgaWYgTnVtYmVyKEludGVydmFsTmFtZXNbcGMgLSAxXS5tYXRjaCgvXFxkKy8pP1swXSkgPT0gZGVncmVlXG4gICAgICAgIG5hbWUgPSBcImQje2RlZ3JlZX1cIiBpZiBOdW1iZXIoSW50ZXJ2YWxOYW1lc1twYyArIDFdLm1hdGNoKC9cXGQrLyk/WzBdKSA9PSBkZWdyZWVcbiAgICAgIG5hbWVcblxuICBhdDogKHJvb3ROYW1lT3JQaXRjaCkgLT5cbiAgICBbcm9vdE5hbWUsIHJvb3RQaXRjaF0gPSBzd2l0Y2ggdHlwZW9mIHJvb3ROYW1lT3JQaXRjaFxuICAgICAgd2hlbiAnc3RyaW5nJ1xuICAgICAgICBbcm9vdE5hbWVPclBpdGNoLCBudWxsXVxuICAgICAgd2hlbiAnbnVtYmVyJ1xuICAgICAgICBbbnVsbCwgcm9vdE5hbWVPclBpdGNoXVxuICAgICAgZWxzZVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCIjcm9vdE5hbWVPclBpdGNofSBtdXN0IGJlIGEgcGl0Y2ggbmFtZSBvciBudW1iZXJcIilcblxuICAgIG5ldyBDaG9yZFxuICAgICAgbmFtZTogQG5hbWVcbiAgICAgIGFiYnJzOiBAYWJicnNcbiAgICAgIGZ1bGxOYW1lOiBAZnVsbE5hbWVcbiAgICAgIHBpdGNoQ2xhc3NlczogQHBpdGNoQ2xhc3Nlc1xuICAgICAgcm9vdE5hbWU6IHJvb3ROYW1lXG4gICAgICByb290UGl0Y2g6IHJvb3RQaXRjaFxuXG4gIGRlZ3JlZU5hbWU6IChkZWdyZWVJbmRleCkgLT5cbiAgICBAY29tcG9uZW50c1tkZWdyZWVJbmRleF1cblxuICBlbmhhcm1vbmljaXplVG86IChwaXRjaE5hbWVBcnJheSkgLT5cbiAgICBmb3IgcGl0Y2hOYW1lLCBwaXRjaENsYXNzIGluIHBpdGNoTmFtZUFycmF5XG4gICAgICBAcm9vdE5hbWUgPSBwaXRjaE5hbWUgaWYgQHJvb3RQaXRjaCA9PSBwaXRjaENsYXNzXG4gICAgcmV0dXJuIHRoaXNcblxuICBAZmluZDogKG5hbWUpIC0+XG4gICAgbWF0Y2ggPSBuYW1lLm1hdGNoKC9eKFthLWdBLUddWyNi4pmv4pmtXSopKC4qKSQvKVxuICAgIHRocm93IG5ldyBFcnJvcihcIiN7bmFtZX0gaXMgbm90IGEgY2hvcmQgbmFtZVwiKSB1bmxlc3MgbWF0Y2hcbiAgICBbbm90ZU5hbWUsIGNob3JkTmFtZV0gPSBtYXRjaFsxLi4uXVxuICAgIHRocm93IG5ldyBFcnJvcihcIiN7bmFtZX0gaXMgbm90IGEgY2hvcmQgbmFtZVwiKSB1bmxlc3MgQ2hvcmRzW2Nob3JkTmFtZV1cbiAgICByZXR1cm4gQ2hvcmRzW2Nob3JkTmFtZV0uYXQobm90ZU5hbWUpXG5cbiAgQGZyb21QaXRjaGVzOiAocGl0Y2hlcykgLT5cbiAgICByb290ID0gcGl0Y2hlc1swXVxuICAgIENob3JkLmZyb21QaXRjaENsYXNzZXMocGl0Y2ggLSByb290IGZvciBwaXRjaCBpbiBwaXRjaGVzKS5hdChyb290KVxuXG4gIEBmcm9tUGl0Y2hDbGFzc2VzOiAocGl0Y2hDbGFzc2VzKSAtPlxuICAgIHBpdGNoQ2xhc3NlcyA9ICgobiArIDEyKSAlIDEyIGZvciBuIGluIHBpdGNoQ2xhc3Nlcykuc29ydCgoYSwgYikgLT4gYSA+IGIpXG4gICAgY2hvcmQgPSBDaG9yZHNbcGl0Y2hDbGFzc2VzXVxuICAgIHRocm93IG5ldyBFcnJvcihcIkNvdWxkbicndCBmaW5kIGNob3JkIHdpdGggcGl0Y2ggY2xhc3NlcyAje3BpdGNoQ2xhc3Nlc31cIikgdW5sZXNzIGNob3JkXG4gICAgcmV0dXJuIGNob3JkXG5cblxuQ2hvcmREZWZpbml0aW9ucyA9IFtcbiAge25hbWU6ICdNYWpvcicsIGFiYnJzOiBbJycsICdNJ10sIHBpdGNoQ2xhc3NlczogJzA0Nyd9LFxuICB7bmFtZTogJ01pbm9yJywgYWJicjogJ20nLCBwaXRjaENsYXNzZXM6ICcwMzcnfSxcbiAge25hbWU6ICdBdWdtZW50ZWQnLCBhYmJyczogWycrJywgJ2F1ZyddLCBwaXRjaENsYXNzZXM6ICcwNDgnfSxcbiAge25hbWU6ICdEaW1pbmlzaGVkJywgYWJicnM6IFsnwrAnLCAnZGltJ10sIHBpdGNoQ2xhc3NlczogJzAzNid9LFxuICB7bmFtZTogJ1N1czInLCBhYmJyOiAnc3VzMicsIHBpdGNoQ2xhc3NlczogJzAyNyd9LFxuICB7bmFtZTogJ1N1czQnLCBhYmJyOiAnc3VzNCcsIHBpdGNoQ2xhc3NlczogJzA1Nyd9LFxuICB7bmFtZTogJ0RvbWluYW50IDd0aCcsIGFiYnJzOiBbJzcnLCAnZG9tNyddLCBwaXRjaENsYXNzZXM6ICcwNDd0J30sXG4gIHtuYW1lOiAnQXVnbWVudGVkIDd0aCcsIGFiYnJzOiBbJys3JywgJzdhdWcnXSwgcGl0Y2hDbGFzc2VzOiAnMDQ4dCd9LFxuICB7bmFtZTogJ0RpbWluaXNoZWQgN3RoJywgYWJicnM6IFsnwrA3JywgJ2RpbTcnXSwgcGl0Y2hDbGFzc2VzOiAnMDM2OSd9LFxuICB7bmFtZTogJ01ham9yIDd0aCcsIGFiYnI6ICdtYWo3JywgcGl0Y2hDbGFzc2VzOiAnMDQ3ZSd9LFxuICB7bmFtZTogJ01pbm9yIDd0aCcsIGFiYnI6ICdtaW43JywgcGl0Y2hDbGFzc2VzOiAnMDM3dCd9LFxuICB7bmFtZTogJ0RvbWluYW50IDdiNScsIGFiYnI6ICc3YjUnLCBwaXRjaENsYXNzZXM6ICcwNDZ0J30sXG4gICMgZm9sbG93aW5nIGlzIGFsc28gaGFsZi1kaW1pbmlzaGVkIDd0aFxuICB7bmFtZTogJ01pbm9yIDd0aCBiNScsIGFiYnJzOiBbJ8O4JywgJ8OYJywgJ203YjUnXSwgcGl0Y2hDbGFzc2VzOiAnMDM2dCd9LFxuICB7bmFtZTogJ0RpbWluaXNoZWQgTWFqIDd0aCcsIGFiYnI6ICfCsE1hajcnLCBwaXRjaENsYXNzZXM6ICcwMzZlJ30sXG4gIHtuYW1lOiAnTWlub3ItTWFqb3IgN3RoJywgYWJicnM6IFsnbWluL21hajcnLCAnbWluKG1hajcpJ10sIHBpdGNoQ2xhc3NlczogJzAzN2UnfSxcbiAge25hbWU6ICc2dGgnLCBhYmJyczogWyc2JywgJ002JywgJ002JywgJ21hajYnXSwgcGl0Y2hDbGFzc2VzOiAnMDQ3OSd9LFxuICB7bmFtZTogJ01pbm9yIDZ0aCcsIGFiYnJzOiBbJ202JywgJ21pbjYnXSwgcGl0Y2hDbGFzc2VzOiAnMDM3OSd9LFxuXVxuXG4jIENob3JkcyBpcyBhbiBhcnJheSBvZiBjaG9yZCBjbGFzc2VzXG5DaG9yZHMgPSBDaG9yZERlZmluaXRpb25zLm1hcCAoc3BlYykgLT5cbiAgc3BlYy5mdWxsTmFtZSA9IHNwZWMubmFtZVxuICBzcGVjLm5hbWUgPSBzcGVjLm5hbWVcbiAgICAucmVwbGFjZSgvTWFqb3IoPyEkKS8sICdNYWonKVxuICAgIC5yZXBsYWNlKC9NaW5vcig/ISQpLywgJ01pbicpXG4gICAgLnJlcGxhY2UoJ0RvbWluYW50JywgJ0RvbScpXG4gICAgLnJlcGxhY2UoJ0RpbWluaXNoZWQnLCAnRGltJylcbiAgc3BlYy5hYmJycyBvcj0gW3NwZWMuYWJicl1cbiAgc3BlYy5hYmJycyA9IHNwZWMuYWJicnMuc3BsaXQoL3MvKSBpZiB0eXBlb2Ygc3BlYy5hYmJycyA9PSAnc3RyaW5nJ1xuICBzcGVjLmFiYnIgb3I9IHNwZWMuYWJicnNbMF1cbiAgc3BlYy5waXRjaENsYXNzZXMgPSBzcGVjLnBpdGNoQ2xhc3Nlcy5tYXRjaCgvLi9nKS5tYXAgKGMpIC0+IHsndCc6MTAsICdlJzoxMX1bY10gb3IgTnVtYmVyKGMpXG4gIG5ldyBDaG9yZCBzcGVjXG5cbiMgYENob3Jkc2AgaXMgYWxzbyBpbmRleGVkIGJ5IGNob3JkIG5hbWVzIGFuZCBhYmJyZXZpYXRpb25zLCBhbmQgYnkgcGl0Y2ggY2xhc3Nlc1xuZG8gLT5cbiAgZm9yIGNob3JkIGluIENob3Jkc1xuICAgIHtuYW1lLCBmdWxsTmFtZSwgYWJicnN9ID0gY2hvcmRcbiAgICBDaG9yZHNba2V5XSA9IGNob3JkIGZvciBrZXkgaW4gW25hbWUsIGZ1bGxOYW1lXS5jb25jYXQoYWJicnMpXG4gICAgQ2hvcmRzW2Nob3JkLnBpdGNoQ2xhc3Nlc10gPSBjaG9yZFxuXG5cbiNcbiMgRXhwb3J0c1xuI1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgQ2hvcmRcbiAgQ2hvcmRzXG4gIEludGVydmFsTmFtZXNcbiAgTG9uZ0ludGVydmFsTmFtZXNcbiAgTW9kZXNcbiAgTm90ZU5hbWVzXG4gIFNjYWxlXG4gIFNjYWxlc1xuICBnZXRQaXRjaENsYXNzTmFtZVxuICBpbnRlcnZhbENsYXNzRGlmZmVyZW5jZVxuICBwaXRjaEZyb21TY2llbnRpZmljTm90YXRpb25cbn1cbiIsIkZ1bmN0aW9uOjpkZWZpbmUgfHw9IChuYW1lLCBkZXNjKSAtPlxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkgQHByb3RvdHlwZSwgbmFtZSwgZGVzY1xuXG5GdW5jdGlvbjo6Y2FjaGVkX2dldHRlciB8fD0gKG5hbWUsIGZuKSAtPlxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkgQHByb3RvdHlwZSwgbmFtZSwgZ2V0OiAtPlxuICAgIGNhY2hlID0gQF9nZXR0ZXJfY2FjaGUgfHw9IHt9XG4gICAgcmV0dXJuIGNhY2hlW25hbWVdIGlmIG5hbWUgb2YgY2FjaGVcbiAgICBjYWNoZVtuYW1lXSA9IGZuLmNhbGwodGhpcylcblxuaHN2MnJnYiA9ICh7aCwgcywgdn0pIC0+XG4gIGggLz0gMzYwXG4gIGMgPSB2ICogc1xuICB4ID0gYyAqICgxIC0gTWF0aC5hYnMoKGggKiA2KSAlIDIgLSAxKSlcbiAgY29tcG9uZW50cyA9IHN3aXRjaCBNYXRoLmZsb29yKGggKiA2KSAlIDZcbiAgICB3aGVuIDAgdGhlbiBbYywgeCwgMF1cbiAgICB3aGVuIDEgdGhlbiBbeCwgYywgMF1cbiAgICB3aGVuIDIgdGhlbiBbMCwgYywgeF1cbiAgICB3aGVuIDMgdGhlbiBbMCwgeCwgY11cbiAgICB3aGVuIDQgdGhlbiBbeCwgMCwgY11cbiAgICB3aGVuIDUgdGhlbiBbYywgMCwgeF1cbiAgW3IsIGcsIGJdID0gKGNvbXBvbmVudCArIHYgLSBjIGZvciBjb21wb25lbnQgaW4gY29tcG9uZW50cylcbiAge3IsIGcsIGJ9XG5cbnJnYjJjc3MgPSAoe3IsIGcsIGJ9KSAtPlxuICBbciwgZywgYl0gPSAoTWF0aC5mbG9vcigyNTUgKiBjKSBmb3IgYyBpbiBbciwgZywgYl0pXG4gIFwicmdiKCN7cn0sICN7Z30sICN7Yn0pXCJcblxuaHN2MmNzcyA9IChoc3YpIC0+IHJnYjJjc3MgaHN2MnJnYihoc3YpXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBoc3YyY3NzXG4gIGhzdjJyZ2JcbiAgcmdiMmNzc1xufVxuIiwiLy8gICAgIFVuZGVyc2NvcmUuanMgMS41LjJcbi8vICAgICBodHRwOi8vdW5kZXJzY29yZWpzLm9yZ1xuLy8gICAgIChjKSAyMDA5LTIwMTMgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbi8vICAgICBVbmRlcnNjb3JlIG1heSBiZSBmcmVlbHkgZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlLlxuXG4oZnVuY3Rpb24oKSB7XG5cbiAgLy8gQmFzZWxpbmUgc2V0dXBcbiAgLy8gLS0tLS0tLS0tLS0tLS1cblxuICAvLyBFc3RhYmxpc2ggdGhlIHJvb3Qgb2JqZWN0LCBgd2luZG93YCBpbiB0aGUgYnJvd3Nlciwgb3IgYGV4cG9ydHNgIG9uIHRoZSBzZXJ2ZXIuXG4gIHZhciByb290ID0gdGhpcztcblxuICAvLyBTYXZlIHRoZSBwcmV2aW91cyB2YWx1ZSBvZiB0aGUgYF9gIHZhcmlhYmxlLlxuICB2YXIgcHJldmlvdXNVbmRlcnNjb3JlID0gcm9vdC5fO1xuXG4gIC8vIEVzdGFibGlzaCB0aGUgb2JqZWN0IHRoYXQgZ2V0cyByZXR1cm5lZCB0byBicmVhayBvdXQgb2YgYSBsb29wIGl0ZXJhdGlvbi5cbiAgdmFyIGJyZWFrZXIgPSB7fTtcblxuICAvLyBTYXZlIGJ5dGVzIGluIHRoZSBtaW5pZmllZCAoYnV0IG5vdCBnemlwcGVkKSB2ZXJzaW9uOlxuICB2YXIgQXJyYXlQcm90byA9IEFycmF5LnByb3RvdHlwZSwgT2JqUHJvdG8gPSBPYmplY3QucHJvdG90eXBlLCBGdW5jUHJvdG8gPSBGdW5jdGlvbi5wcm90b3R5cGU7XG5cbiAgLy8gQ3JlYXRlIHF1aWNrIHJlZmVyZW5jZSB2YXJpYWJsZXMgZm9yIHNwZWVkIGFjY2VzcyB0byBjb3JlIHByb3RvdHlwZXMuXG4gIHZhclxuICAgIHB1c2ggICAgICAgICAgICAgPSBBcnJheVByb3RvLnB1c2gsXG4gICAgc2xpY2UgICAgICAgICAgICA9IEFycmF5UHJvdG8uc2xpY2UsXG4gICAgY29uY2F0ICAgICAgICAgICA9IEFycmF5UHJvdG8uY29uY2F0LFxuICAgIHRvU3RyaW5nICAgICAgICAgPSBPYmpQcm90by50b1N0cmluZyxcbiAgICBoYXNPd25Qcm9wZXJ0eSAgID0gT2JqUHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbiAgLy8gQWxsICoqRUNNQVNjcmlwdCA1KiogbmF0aXZlIGZ1bmN0aW9uIGltcGxlbWVudGF0aW9ucyB0aGF0IHdlIGhvcGUgdG8gdXNlXG4gIC8vIGFyZSBkZWNsYXJlZCBoZXJlLlxuICB2YXJcbiAgICBuYXRpdmVGb3JFYWNoICAgICAgPSBBcnJheVByb3RvLmZvckVhY2gsXG4gICAgbmF0aXZlTWFwICAgICAgICAgID0gQXJyYXlQcm90by5tYXAsXG4gICAgbmF0aXZlUmVkdWNlICAgICAgID0gQXJyYXlQcm90by5yZWR1Y2UsXG4gICAgbmF0aXZlUmVkdWNlUmlnaHQgID0gQXJyYXlQcm90by5yZWR1Y2VSaWdodCxcbiAgICBuYXRpdmVGaWx0ZXIgICAgICAgPSBBcnJheVByb3RvLmZpbHRlcixcbiAgICBuYXRpdmVFdmVyeSAgICAgICAgPSBBcnJheVByb3RvLmV2ZXJ5LFxuICAgIG5hdGl2ZVNvbWUgICAgICAgICA9IEFycmF5UHJvdG8uc29tZSxcbiAgICBuYXRpdmVJbmRleE9mICAgICAgPSBBcnJheVByb3RvLmluZGV4T2YsXG4gICAgbmF0aXZlTGFzdEluZGV4T2YgID0gQXJyYXlQcm90by5sYXN0SW5kZXhPZixcbiAgICBuYXRpdmVJc0FycmF5ICAgICAgPSBBcnJheS5pc0FycmF5LFxuICAgIG5hdGl2ZUtleXMgICAgICAgICA9IE9iamVjdC5rZXlzLFxuICAgIG5hdGl2ZUJpbmQgICAgICAgICA9IEZ1bmNQcm90by5iaW5kO1xuXG4gIC8vIENyZWF0ZSBhIHNhZmUgcmVmZXJlbmNlIHRvIHRoZSBVbmRlcnNjb3JlIG9iamVjdCBmb3IgdXNlIGJlbG93LlxuICB2YXIgXyA9IGZ1bmN0aW9uKG9iaikge1xuICAgIGlmIChvYmogaW5zdGFuY2VvZiBfKSByZXR1cm4gb2JqO1xuICAgIGlmICghKHRoaXMgaW5zdGFuY2VvZiBfKSkgcmV0dXJuIG5ldyBfKG9iaik7XG4gICAgdGhpcy5fd3JhcHBlZCA9IG9iajtcbiAgfTtcblxuICAvLyBFeHBvcnQgdGhlIFVuZGVyc2NvcmUgb2JqZWN0IGZvciAqKk5vZGUuanMqKiwgd2l0aFxuICAvLyBiYWNrd2FyZHMtY29tcGF0aWJpbGl0eSBmb3IgdGhlIG9sZCBgcmVxdWlyZSgpYCBBUEkuIElmIHdlJ3JlIGluXG4gIC8vIHRoZSBicm93c2VyLCBhZGQgYF9gIGFzIGEgZ2xvYmFsIG9iamVjdCB2aWEgYSBzdHJpbmcgaWRlbnRpZmllcixcbiAgLy8gZm9yIENsb3N1cmUgQ29tcGlsZXIgXCJhZHZhbmNlZFwiIG1vZGUuXG4gIGlmICh0eXBlb2YgZXhwb3J0cyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgICAgIGV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IF87XG4gICAgfVxuICAgIGV4cG9ydHMuXyA9IF87XG4gIH0gZWxzZSB7XG4gICAgcm9vdC5fID0gXztcbiAgfVxuXG4gIC8vIEN1cnJlbnQgdmVyc2lvbi5cbiAgXy5WRVJTSU9OID0gJzEuNS4yJztcblxuICAvLyBDb2xsZWN0aW9uIEZ1bmN0aW9uc1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIFRoZSBjb3JuZXJzdG9uZSwgYW4gYGVhY2hgIGltcGxlbWVudGF0aW9uLCBha2EgYGZvckVhY2hgLlxuICAvLyBIYW5kbGVzIG9iamVjdHMgd2l0aCB0aGUgYnVpbHQtaW4gYGZvckVhY2hgLCBhcnJheXMsIGFuZCByYXcgb2JqZWN0cy5cbiAgLy8gRGVsZWdhdGVzIHRvICoqRUNNQVNjcmlwdCA1KioncyBuYXRpdmUgYGZvckVhY2hgIGlmIGF2YWlsYWJsZS5cbiAgdmFyIGVhY2ggPSBfLmVhY2ggPSBfLmZvckVhY2ggPSBmdW5jdGlvbihvYmosIGl0ZXJhdG9yLCBjb250ZXh0KSB7XG4gICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm47XG4gICAgaWYgKG5hdGl2ZUZvckVhY2ggJiYgb2JqLmZvckVhY2ggPT09IG5hdGl2ZUZvckVhY2gpIHtcbiAgICAgIG9iai5mb3JFYWNoKGl0ZXJhdG9yLCBjb250ZXh0KTtcbiAgICB9IGVsc2UgaWYgKG9iai5sZW5ndGggPT09ICtvYmoubGVuZ3RoKSB7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gb2JqLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChpdGVyYXRvci5jYWxsKGNvbnRleHQsIG9ialtpXSwgaSwgb2JqKSA9PT0gYnJlYWtlcikgcmV0dXJuO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB2YXIga2V5cyA9IF8ua2V5cyhvYmopO1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGtleXMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKGl0ZXJhdG9yLmNhbGwoY29udGV4dCwgb2JqW2tleXNbaV1dLCBrZXlzW2ldLCBvYmopID09PSBicmVha2VyKSByZXR1cm47XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIC8vIFJldHVybiB0aGUgcmVzdWx0cyBvZiBhcHBseWluZyB0aGUgaXRlcmF0b3IgdG8gZWFjaCBlbGVtZW50LlxuICAvLyBEZWxlZ2F0ZXMgdG8gKipFQ01BU2NyaXB0IDUqKidzIG5hdGl2ZSBgbWFwYCBpZiBhdmFpbGFibGUuXG4gIF8ubWFwID0gXy5jb2xsZWN0ID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRvciwgY29udGV4dCkge1xuICAgIHZhciByZXN1bHRzID0gW107XG4gICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gcmVzdWx0cztcbiAgICBpZiAobmF0aXZlTWFwICYmIG9iai5tYXAgPT09IG5hdGl2ZU1hcCkgcmV0dXJuIG9iai5tYXAoaXRlcmF0b3IsIGNvbnRleHQpO1xuICAgIGVhY2gob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGxpc3QpIHtcbiAgICAgIHJlc3VsdHMucHVzaChpdGVyYXRvci5jYWxsKGNvbnRleHQsIHZhbHVlLCBpbmRleCwgbGlzdCkpO1xuICAgIH0pO1xuICAgIHJldHVybiByZXN1bHRzO1xuICB9O1xuXG4gIHZhciByZWR1Y2VFcnJvciA9ICdSZWR1Y2Ugb2YgZW1wdHkgYXJyYXkgd2l0aCBubyBpbml0aWFsIHZhbHVlJztcblxuICAvLyAqKlJlZHVjZSoqIGJ1aWxkcyB1cCBhIHNpbmdsZSByZXN1bHQgZnJvbSBhIGxpc3Qgb2YgdmFsdWVzLCBha2EgYGluamVjdGAsXG4gIC8vIG9yIGBmb2xkbGAuIERlbGVnYXRlcyB0byAqKkVDTUFTY3JpcHQgNSoqJ3MgbmF0aXZlIGByZWR1Y2VgIGlmIGF2YWlsYWJsZS5cbiAgXy5yZWR1Y2UgPSBfLmZvbGRsID0gXy5pbmplY3QgPSBmdW5jdGlvbihvYmosIGl0ZXJhdG9yLCBtZW1vLCBjb250ZXh0KSB7XG4gICAgdmFyIGluaXRpYWwgPSBhcmd1bWVudHMubGVuZ3RoID4gMjtcbiAgICBpZiAob2JqID09IG51bGwpIG9iaiA9IFtdO1xuICAgIGlmIChuYXRpdmVSZWR1Y2UgJiYgb2JqLnJlZHVjZSA9PT0gbmF0aXZlUmVkdWNlKSB7XG4gICAgICBpZiAoY29udGV4dCkgaXRlcmF0b3IgPSBfLmJpbmQoaXRlcmF0b3IsIGNvbnRleHQpO1xuICAgICAgcmV0dXJuIGluaXRpYWwgPyBvYmoucmVkdWNlKGl0ZXJhdG9yLCBtZW1vKSA6IG9iai5yZWR1Y2UoaXRlcmF0b3IpO1xuICAgIH1cbiAgICBlYWNoKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBsaXN0KSB7XG4gICAgICBpZiAoIWluaXRpYWwpIHtcbiAgICAgICAgbWVtbyA9IHZhbHVlO1xuICAgICAgICBpbml0aWFsID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG1lbW8gPSBpdGVyYXRvci5jYWxsKGNvbnRleHQsIG1lbW8sIHZhbHVlLCBpbmRleCwgbGlzdCk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgaWYgKCFpbml0aWFsKSB0aHJvdyBuZXcgVHlwZUVycm9yKHJlZHVjZUVycm9yKTtcbiAgICByZXR1cm4gbWVtbztcbiAgfTtcblxuICAvLyBUaGUgcmlnaHQtYXNzb2NpYXRpdmUgdmVyc2lvbiBvZiByZWR1Y2UsIGFsc28ga25vd24gYXMgYGZvbGRyYC5cbiAgLy8gRGVsZWdhdGVzIHRvICoqRUNNQVNjcmlwdCA1KioncyBuYXRpdmUgYHJlZHVjZVJpZ2h0YCBpZiBhdmFpbGFibGUuXG4gIF8ucmVkdWNlUmlnaHQgPSBfLmZvbGRyID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRvciwgbWVtbywgY29udGV4dCkge1xuICAgIHZhciBpbml0aWFsID0gYXJndW1lbnRzLmxlbmd0aCA+IDI7XG4gICAgaWYgKG9iaiA9PSBudWxsKSBvYmogPSBbXTtcbiAgICBpZiAobmF0aXZlUmVkdWNlUmlnaHQgJiYgb2JqLnJlZHVjZVJpZ2h0ID09PSBuYXRpdmVSZWR1Y2VSaWdodCkge1xuICAgICAgaWYgKGNvbnRleHQpIGl0ZXJhdG9yID0gXy5iaW5kKGl0ZXJhdG9yLCBjb250ZXh0KTtcbiAgICAgIHJldHVybiBpbml0aWFsID8gb2JqLnJlZHVjZVJpZ2h0KGl0ZXJhdG9yLCBtZW1vKSA6IG9iai5yZWR1Y2VSaWdodChpdGVyYXRvcik7XG4gICAgfVxuICAgIHZhciBsZW5ndGggPSBvYmoubGVuZ3RoO1xuICAgIGlmIChsZW5ndGggIT09ICtsZW5ndGgpIHtcbiAgICAgIHZhciBrZXlzID0gXy5rZXlzKG9iaik7XG4gICAgICBsZW5ndGggPSBrZXlzLmxlbmd0aDtcbiAgICB9XG4gICAgZWFjaChvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgbGlzdCkge1xuICAgICAgaW5kZXggPSBrZXlzID8ga2V5c1stLWxlbmd0aF0gOiAtLWxlbmd0aDtcbiAgICAgIGlmICghaW5pdGlhbCkge1xuICAgICAgICBtZW1vID0gb2JqW2luZGV4XTtcbiAgICAgICAgaW5pdGlhbCA9IHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBtZW1vID0gaXRlcmF0b3IuY2FsbChjb250ZXh0LCBtZW1vLCBvYmpbaW5kZXhdLCBpbmRleCwgbGlzdCk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgaWYgKCFpbml0aWFsKSB0aHJvdyBuZXcgVHlwZUVycm9yKHJlZHVjZUVycm9yKTtcbiAgICByZXR1cm4gbWVtbztcbiAgfTtcblxuICAvLyBSZXR1cm4gdGhlIGZpcnN0IHZhbHVlIHdoaWNoIHBhc3NlcyBhIHRydXRoIHRlc3QuIEFsaWFzZWQgYXMgYGRldGVjdGAuXG4gIF8uZmluZCA9IF8uZGV0ZWN0ID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRvciwgY29udGV4dCkge1xuICAgIHZhciByZXN1bHQ7XG4gICAgYW55KG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBsaXN0KSB7XG4gICAgICBpZiAoaXRlcmF0b3IuY2FsbChjb250ZXh0LCB2YWx1ZSwgaW5kZXgsIGxpc3QpKSB7XG4gICAgICAgIHJlc3VsdCA9IHZhbHVlO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIC8vIFJldHVybiBhbGwgdGhlIGVsZW1lbnRzIHRoYXQgcGFzcyBhIHRydXRoIHRlc3QuXG4gIC8vIERlbGVnYXRlcyB0byAqKkVDTUFTY3JpcHQgNSoqJ3MgbmF0aXZlIGBmaWx0ZXJgIGlmIGF2YWlsYWJsZS5cbiAgLy8gQWxpYXNlZCBhcyBgc2VsZWN0YC5cbiAgXy5maWx0ZXIgPSBfLnNlbGVjdCA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0b3IsIGNvbnRleHQpIHtcbiAgICB2YXIgcmVzdWx0cyA9IFtdO1xuICAgIGlmIChvYmogPT0gbnVsbCkgcmV0dXJuIHJlc3VsdHM7XG4gICAgaWYgKG5hdGl2ZUZpbHRlciAmJiBvYmouZmlsdGVyID09PSBuYXRpdmVGaWx0ZXIpIHJldHVybiBvYmouZmlsdGVyKGl0ZXJhdG9yLCBjb250ZXh0KTtcbiAgICBlYWNoKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBsaXN0KSB7XG4gICAgICBpZiAoaXRlcmF0b3IuY2FsbChjb250ZXh0LCB2YWx1ZSwgaW5kZXgsIGxpc3QpKSByZXN1bHRzLnB1c2godmFsdWUpO1xuICAgIH0pO1xuICAgIHJldHVybiByZXN1bHRzO1xuICB9O1xuXG4gIC8vIFJldHVybiBhbGwgdGhlIGVsZW1lbnRzIGZvciB3aGljaCBhIHRydXRoIHRlc3QgZmFpbHMuXG4gIF8ucmVqZWN0ID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRvciwgY29udGV4dCkge1xuICAgIHJldHVybiBfLmZpbHRlcihvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgbGlzdCkge1xuICAgICAgcmV0dXJuICFpdGVyYXRvci5jYWxsKGNvbnRleHQsIHZhbHVlLCBpbmRleCwgbGlzdCk7XG4gICAgfSwgY29udGV4dCk7XG4gIH07XG5cbiAgLy8gRGV0ZXJtaW5lIHdoZXRoZXIgYWxsIG9mIHRoZSBlbGVtZW50cyBtYXRjaCBhIHRydXRoIHRlc3QuXG4gIC8vIERlbGVnYXRlcyB0byAqKkVDTUFTY3JpcHQgNSoqJ3MgbmF0aXZlIGBldmVyeWAgaWYgYXZhaWxhYmxlLlxuICAvLyBBbGlhc2VkIGFzIGBhbGxgLlxuICBfLmV2ZXJ5ID0gXy5hbGwgPSBmdW5jdGlvbihvYmosIGl0ZXJhdG9yLCBjb250ZXh0KSB7XG4gICAgaXRlcmF0b3IgfHwgKGl0ZXJhdG9yID0gXy5pZGVudGl0eSk7XG4gICAgdmFyIHJlc3VsdCA9IHRydWU7XG4gICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gcmVzdWx0O1xuICAgIGlmIChuYXRpdmVFdmVyeSAmJiBvYmouZXZlcnkgPT09IG5hdGl2ZUV2ZXJ5KSByZXR1cm4gb2JqLmV2ZXJ5KGl0ZXJhdG9yLCBjb250ZXh0KTtcbiAgICBlYWNoKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBsaXN0KSB7XG4gICAgICBpZiAoIShyZXN1bHQgPSByZXN1bHQgJiYgaXRlcmF0b3IuY2FsbChjb250ZXh0LCB2YWx1ZSwgaW5kZXgsIGxpc3QpKSkgcmV0dXJuIGJyZWFrZXI7XG4gICAgfSk7XG4gICAgcmV0dXJuICEhcmVzdWx0O1xuICB9O1xuXG4gIC8vIERldGVybWluZSBpZiBhdCBsZWFzdCBvbmUgZWxlbWVudCBpbiB0aGUgb2JqZWN0IG1hdGNoZXMgYSB0cnV0aCB0ZXN0LlxuICAvLyBEZWxlZ2F0ZXMgdG8gKipFQ01BU2NyaXB0IDUqKidzIG5hdGl2ZSBgc29tZWAgaWYgYXZhaWxhYmxlLlxuICAvLyBBbGlhc2VkIGFzIGBhbnlgLlxuICB2YXIgYW55ID0gXy5zb21lID0gXy5hbnkgPSBmdW5jdGlvbihvYmosIGl0ZXJhdG9yLCBjb250ZXh0KSB7XG4gICAgaXRlcmF0b3IgfHwgKGl0ZXJhdG9yID0gXy5pZGVudGl0eSk7XG4gICAgdmFyIHJlc3VsdCA9IGZhbHNlO1xuICAgIGlmIChvYmogPT0gbnVsbCkgcmV0dXJuIHJlc3VsdDtcbiAgICBpZiAobmF0aXZlU29tZSAmJiBvYmouc29tZSA9PT0gbmF0aXZlU29tZSkgcmV0dXJuIG9iai5zb21lKGl0ZXJhdG9yLCBjb250ZXh0KTtcbiAgICBlYWNoKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBsaXN0KSB7XG4gICAgICBpZiAocmVzdWx0IHx8IChyZXN1bHQgPSBpdGVyYXRvci5jYWxsKGNvbnRleHQsIHZhbHVlLCBpbmRleCwgbGlzdCkpKSByZXR1cm4gYnJlYWtlcjtcbiAgICB9KTtcbiAgICByZXR1cm4gISFyZXN1bHQ7XG4gIH07XG5cbiAgLy8gRGV0ZXJtaW5lIGlmIHRoZSBhcnJheSBvciBvYmplY3QgY29udGFpbnMgYSBnaXZlbiB2YWx1ZSAodXNpbmcgYD09PWApLlxuICAvLyBBbGlhc2VkIGFzIGBpbmNsdWRlYC5cbiAgXy5jb250YWlucyA9IF8uaW5jbHVkZSA9IGZ1bmN0aW9uKG9iaiwgdGFyZ2V0KSB7XG4gICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gZmFsc2U7XG4gICAgaWYgKG5hdGl2ZUluZGV4T2YgJiYgb2JqLmluZGV4T2YgPT09IG5hdGl2ZUluZGV4T2YpIHJldHVybiBvYmouaW5kZXhPZih0YXJnZXQpICE9IC0xO1xuICAgIHJldHVybiBhbnkob2JqLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgcmV0dXJuIHZhbHVlID09PSB0YXJnZXQ7XG4gICAgfSk7XG4gIH07XG5cbiAgLy8gSW52b2tlIGEgbWV0aG9kICh3aXRoIGFyZ3VtZW50cykgb24gZXZlcnkgaXRlbSBpbiBhIGNvbGxlY3Rpb24uXG4gIF8uaW52b2tlID0gZnVuY3Rpb24ob2JqLCBtZXRob2QpIHtcbiAgICB2YXIgYXJncyA9IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAyKTtcbiAgICB2YXIgaXNGdW5jID0gXy5pc0Z1bmN0aW9uKG1ldGhvZCk7XG4gICAgcmV0dXJuIF8ubWFwKG9iaiwgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIHJldHVybiAoaXNGdW5jID8gbWV0aG9kIDogdmFsdWVbbWV0aG9kXSkuYXBwbHkodmFsdWUsIGFyZ3MpO1xuICAgIH0pO1xuICB9O1xuXG4gIC8vIENvbnZlbmllbmNlIHZlcnNpb24gb2YgYSBjb21tb24gdXNlIGNhc2Ugb2YgYG1hcGA6IGZldGNoaW5nIGEgcHJvcGVydHkuXG4gIF8ucGx1Y2sgPSBmdW5jdGlvbihvYmosIGtleSkge1xuICAgIHJldHVybiBfLm1hcChvYmosIGZ1bmN0aW9uKHZhbHVlKXsgcmV0dXJuIHZhbHVlW2tleV07IH0pO1xuICB9O1xuXG4gIC8vIENvbnZlbmllbmNlIHZlcnNpb24gb2YgYSBjb21tb24gdXNlIGNhc2Ugb2YgYGZpbHRlcmA6IHNlbGVjdGluZyBvbmx5IG9iamVjdHNcbiAgLy8gY29udGFpbmluZyBzcGVjaWZpYyBga2V5OnZhbHVlYCBwYWlycy5cbiAgXy53aGVyZSA9IGZ1bmN0aW9uKG9iaiwgYXR0cnMsIGZpcnN0KSB7XG4gICAgaWYgKF8uaXNFbXB0eShhdHRycykpIHJldHVybiBmaXJzdCA/IHZvaWQgMCA6IFtdO1xuICAgIHJldHVybiBfW2ZpcnN0ID8gJ2ZpbmQnIDogJ2ZpbHRlciddKG9iaiwgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIGZvciAodmFyIGtleSBpbiBhdHRycykge1xuICAgICAgICBpZiAoYXR0cnNba2V5XSAhPT0gdmFsdWVba2V5XSkgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSk7XG4gIH07XG5cbiAgLy8gQ29udmVuaWVuY2UgdmVyc2lvbiBvZiBhIGNvbW1vbiB1c2UgY2FzZSBvZiBgZmluZGA6IGdldHRpbmcgdGhlIGZpcnN0IG9iamVjdFxuICAvLyBjb250YWluaW5nIHNwZWNpZmljIGBrZXk6dmFsdWVgIHBhaXJzLlxuICBfLmZpbmRXaGVyZSA9IGZ1bmN0aW9uKG9iaiwgYXR0cnMpIHtcbiAgICByZXR1cm4gXy53aGVyZShvYmosIGF0dHJzLCB0cnVlKTtcbiAgfTtcblxuICAvLyBSZXR1cm4gdGhlIG1heGltdW0gZWxlbWVudCBvciAoZWxlbWVudC1iYXNlZCBjb21wdXRhdGlvbikuXG4gIC8vIENhbid0IG9wdGltaXplIGFycmF5cyBvZiBpbnRlZ2VycyBsb25nZXIgdGhhbiA2NSw1MzUgZWxlbWVudHMuXG4gIC8vIFNlZSBbV2ViS2l0IEJ1ZyA4MDc5N10oaHR0cHM6Ly9idWdzLndlYmtpdC5vcmcvc2hvd19idWcuY2dpP2lkPTgwNzk3KVxuICBfLm1heCA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0b3IsIGNvbnRleHQpIHtcbiAgICBpZiAoIWl0ZXJhdG9yICYmIF8uaXNBcnJheShvYmopICYmIG9ialswXSA9PT0gK29ialswXSAmJiBvYmoubGVuZ3RoIDwgNjU1MzUpIHtcbiAgICAgIHJldHVybiBNYXRoLm1heC5hcHBseShNYXRoLCBvYmopO1xuICAgIH1cbiAgICBpZiAoIWl0ZXJhdG9yICYmIF8uaXNFbXB0eShvYmopKSByZXR1cm4gLUluZmluaXR5O1xuICAgIHZhciByZXN1bHQgPSB7Y29tcHV0ZWQgOiAtSW5maW5pdHksIHZhbHVlOiAtSW5maW5pdHl9O1xuICAgIGVhY2gob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGxpc3QpIHtcbiAgICAgIHZhciBjb21wdXRlZCA9IGl0ZXJhdG9yID8gaXRlcmF0b3IuY2FsbChjb250ZXh0LCB2YWx1ZSwgaW5kZXgsIGxpc3QpIDogdmFsdWU7XG4gICAgICBjb21wdXRlZCA+IHJlc3VsdC5jb21wdXRlZCAmJiAocmVzdWx0ID0ge3ZhbHVlIDogdmFsdWUsIGNvbXB1dGVkIDogY29tcHV0ZWR9KTtcbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0LnZhbHVlO1xuICB9O1xuXG4gIC8vIFJldHVybiB0aGUgbWluaW11bSBlbGVtZW50IChvciBlbGVtZW50LWJhc2VkIGNvbXB1dGF0aW9uKS5cbiAgXy5taW4gPSBmdW5jdGlvbihvYmosIGl0ZXJhdG9yLCBjb250ZXh0KSB7XG4gICAgaWYgKCFpdGVyYXRvciAmJiBfLmlzQXJyYXkob2JqKSAmJiBvYmpbMF0gPT09ICtvYmpbMF0gJiYgb2JqLmxlbmd0aCA8IDY1NTM1KSB7XG4gICAgICByZXR1cm4gTWF0aC5taW4uYXBwbHkoTWF0aCwgb2JqKTtcbiAgICB9XG4gICAgaWYgKCFpdGVyYXRvciAmJiBfLmlzRW1wdHkob2JqKSkgcmV0dXJuIEluZmluaXR5O1xuICAgIHZhciByZXN1bHQgPSB7Y29tcHV0ZWQgOiBJbmZpbml0eSwgdmFsdWU6IEluZmluaXR5fTtcbiAgICBlYWNoKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBsaXN0KSB7XG4gICAgICB2YXIgY29tcHV0ZWQgPSBpdGVyYXRvciA/IGl0ZXJhdG9yLmNhbGwoY29udGV4dCwgdmFsdWUsIGluZGV4LCBsaXN0KSA6IHZhbHVlO1xuICAgICAgY29tcHV0ZWQgPCByZXN1bHQuY29tcHV0ZWQgJiYgKHJlc3VsdCA9IHt2YWx1ZSA6IHZhbHVlLCBjb21wdXRlZCA6IGNvbXB1dGVkfSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdC52YWx1ZTtcbiAgfTtcblxuICAvLyBTaHVmZmxlIGFuIGFycmF5LCB1c2luZyB0aGUgbW9kZXJuIHZlcnNpb24gb2YgdGhlIFxuICAvLyBbRmlzaGVyLVlhdGVzIHNodWZmbGVdKGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvRmlzaGVy4oCTWWF0ZXNfc2h1ZmZsZSkuXG4gIF8uc2h1ZmZsZSA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciByYW5kO1xuICAgIHZhciBpbmRleCA9IDA7XG4gICAgdmFyIHNodWZmbGVkID0gW107XG4gICAgZWFjaChvYmosIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICByYW5kID0gXy5yYW5kb20oaW5kZXgrKyk7XG4gICAgICBzaHVmZmxlZFtpbmRleCAtIDFdID0gc2h1ZmZsZWRbcmFuZF07XG4gICAgICBzaHVmZmxlZFtyYW5kXSA9IHZhbHVlO1xuICAgIH0pO1xuICAgIHJldHVybiBzaHVmZmxlZDtcbiAgfTtcblxuICAvLyBTYW1wbGUgKipuKiogcmFuZG9tIHZhbHVlcyBmcm9tIGFuIGFycmF5LlxuICAvLyBJZiAqKm4qKiBpcyBub3Qgc3BlY2lmaWVkLCByZXR1cm5zIGEgc2luZ2xlIHJhbmRvbSBlbGVtZW50IGZyb20gdGhlIGFycmF5LlxuICAvLyBUaGUgaW50ZXJuYWwgYGd1YXJkYCBhcmd1bWVudCBhbGxvd3MgaXQgdG8gd29yayB3aXRoIGBtYXBgLlxuICBfLnNhbXBsZSA9IGZ1bmN0aW9uKG9iaiwgbiwgZ3VhcmQpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDIgfHwgZ3VhcmQpIHtcbiAgICAgIHJldHVybiBvYmpbXy5yYW5kb20ob2JqLmxlbmd0aCAtIDEpXTtcbiAgICB9XG4gICAgcmV0dXJuIF8uc2h1ZmZsZShvYmopLnNsaWNlKDAsIE1hdGgubWF4KDAsIG4pKTtcbiAgfTtcblxuICAvLyBBbiBpbnRlcm5hbCBmdW5jdGlvbiB0byBnZW5lcmF0ZSBsb29rdXAgaXRlcmF0b3JzLlxuICB2YXIgbG9va3VwSXRlcmF0b3IgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgIHJldHVybiBfLmlzRnVuY3Rpb24odmFsdWUpID8gdmFsdWUgOiBmdW5jdGlvbihvYmopeyByZXR1cm4gb2JqW3ZhbHVlXTsgfTtcbiAgfTtcblxuICAvLyBTb3J0IHRoZSBvYmplY3QncyB2YWx1ZXMgYnkgYSBjcml0ZXJpb24gcHJvZHVjZWQgYnkgYW4gaXRlcmF0b3IuXG4gIF8uc29ydEJ5ID0gZnVuY3Rpb24ob2JqLCB2YWx1ZSwgY29udGV4dCkge1xuICAgIHZhciBpdGVyYXRvciA9IGxvb2t1cEl0ZXJhdG9yKHZhbHVlKTtcbiAgICByZXR1cm4gXy5wbHVjayhfLm1hcChvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgbGlzdCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICBpbmRleDogaW5kZXgsXG4gICAgICAgIGNyaXRlcmlhOiBpdGVyYXRvci5jYWxsKGNvbnRleHQsIHZhbHVlLCBpbmRleCwgbGlzdClcbiAgICAgIH07XG4gICAgfSkuc29ydChmdW5jdGlvbihsZWZ0LCByaWdodCkge1xuICAgICAgdmFyIGEgPSBsZWZ0LmNyaXRlcmlhO1xuICAgICAgdmFyIGIgPSByaWdodC5jcml0ZXJpYTtcbiAgICAgIGlmIChhICE9PSBiKSB7XG4gICAgICAgIGlmIChhID4gYiB8fCBhID09PSB2b2lkIDApIHJldHVybiAxO1xuICAgICAgICBpZiAoYSA8IGIgfHwgYiA9PT0gdm9pZCAwKSByZXR1cm4gLTE7XG4gICAgICB9XG4gICAgICByZXR1cm4gbGVmdC5pbmRleCAtIHJpZ2h0LmluZGV4O1xuICAgIH0pLCAndmFsdWUnKTtcbiAgfTtcblxuICAvLyBBbiBpbnRlcm5hbCBmdW5jdGlvbiB1c2VkIGZvciBhZ2dyZWdhdGUgXCJncm91cCBieVwiIG9wZXJhdGlvbnMuXG4gIHZhciBncm91cCA9IGZ1bmN0aW9uKGJlaGF2aW9yKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKG9iaiwgdmFsdWUsIGNvbnRleHQpIHtcbiAgICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICAgIHZhciBpdGVyYXRvciA9IHZhbHVlID09IG51bGwgPyBfLmlkZW50aXR5IDogbG9va3VwSXRlcmF0b3IodmFsdWUpO1xuICAgICAgZWFjaChvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCkge1xuICAgICAgICB2YXIga2V5ID0gaXRlcmF0b3IuY2FsbChjb250ZXh0LCB2YWx1ZSwgaW5kZXgsIG9iaik7XG4gICAgICAgIGJlaGF2aW9yKHJlc3VsdCwga2V5LCB2YWx1ZSk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbiAgfTtcblxuICAvLyBHcm91cHMgdGhlIG9iamVjdCdzIHZhbHVlcyBieSBhIGNyaXRlcmlvbi4gUGFzcyBlaXRoZXIgYSBzdHJpbmcgYXR0cmlidXRlXG4gIC8vIHRvIGdyb3VwIGJ5LCBvciBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyB0aGUgY3JpdGVyaW9uLlxuICBfLmdyb3VwQnkgPSBncm91cChmdW5jdGlvbihyZXN1bHQsIGtleSwgdmFsdWUpIHtcbiAgICAoXy5oYXMocmVzdWx0LCBrZXkpID8gcmVzdWx0W2tleV0gOiAocmVzdWx0W2tleV0gPSBbXSkpLnB1c2godmFsdWUpO1xuICB9KTtcblxuICAvLyBJbmRleGVzIHRoZSBvYmplY3QncyB2YWx1ZXMgYnkgYSBjcml0ZXJpb24sIHNpbWlsYXIgdG8gYGdyb3VwQnlgLCBidXQgZm9yXG4gIC8vIHdoZW4geW91IGtub3cgdGhhdCB5b3VyIGluZGV4IHZhbHVlcyB3aWxsIGJlIHVuaXF1ZS5cbiAgXy5pbmRleEJ5ID0gZ3JvdXAoZnVuY3Rpb24ocmVzdWx0LCBrZXksIHZhbHVlKSB7XG4gICAgcmVzdWx0W2tleV0gPSB2YWx1ZTtcbiAgfSk7XG5cbiAgLy8gQ291bnRzIGluc3RhbmNlcyBvZiBhbiBvYmplY3QgdGhhdCBncm91cCBieSBhIGNlcnRhaW4gY3JpdGVyaW9uLiBQYXNzXG4gIC8vIGVpdGhlciBhIHN0cmluZyBhdHRyaWJ1dGUgdG8gY291bnQgYnksIG9yIGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIHRoZVxuICAvLyBjcml0ZXJpb24uXG4gIF8uY291bnRCeSA9IGdyb3VwKGZ1bmN0aW9uKHJlc3VsdCwga2V5KSB7XG4gICAgXy5oYXMocmVzdWx0LCBrZXkpID8gcmVzdWx0W2tleV0rKyA6IHJlc3VsdFtrZXldID0gMTtcbiAgfSk7XG5cbiAgLy8gVXNlIGEgY29tcGFyYXRvciBmdW5jdGlvbiB0byBmaWd1cmUgb3V0IHRoZSBzbWFsbGVzdCBpbmRleCBhdCB3aGljaFxuICAvLyBhbiBvYmplY3Qgc2hvdWxkIGJlIGluc2VydGVkIHNvIGFzIHRvIG1haW50YWluIG9yZGVyLiBVc2VzIGJpbmFyeSBzZWFyY2guXG4gIF8uc29ydGVkSW5kZXggPSBmdW5jdGlvbihhcnJheSwgb2JqLCBpdGVyYXRvciwgY29udGV4dCkge1xuICAgIGl0ZXJhdG9yID0gaXRlcmF0b3IgPT0gbnVsbCA/IF8uaWRlbnRpdHkgOiBsb29rdXBJdGVyYXRvcihpdGVyYXRvcik7XG4gICAgdmFyIHZhbHVlID0gaXRlcmF0b3IuY2FsbChjb250ZXh0LCBvYmopO1xuICAgIHZhciBsb3cgPSAwLCBoaWdoID0gYXJyYXkubGVuZ3RoO1xuICAgIHdoaWxlIChsb3cgPCBoaWdoKSB7XG4gICAgICB2YXIgbWlkID0gKGxvdyArIGhpZ2gpID4+PiAxO1xuICAgICAgaXRlcmF0b3IuY2FsbChjb250ZXh0LCBhcnJheVttaWRdKSA8IHZhbHVlID8gbG93ID0gbWlkICsgMSA6IGhpZ2ggPSBtaWQ7XG4gICAgfVxuICAgIHJldHVybiBsb3c7XG4gIH07XG5cbiAgLy8gU2FmZWx5IGNyZWF0ZSBhIHJlYWwsIGxpdmUgYXJyYXkgZnJvbSBhbnl0aGluZyBpdGVyYWJsZS5cbiAgXy50b0FycmF5ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKCFvYmopIHJldHVybiBbXTtcbiAgICBpZiAoXy5pc0FycmF5KG9iaikpIHJldHVybiBzbGljZS5jYWxsKG9iaik7XG4gICAgaWYgKG9iai5sZW5ndGggPT09ICtvYmoubGVuZ3RoKSByZXR1cm4gXy5tYXAob2JqLCBfLmlkZW50aXR5KTtcbiAgICByZXR1cm4gXy52YWx1ZXMob2JqKTtcbiAgfTtcblxuICAvLyBSZXR1cm4gdGhlIG51bWJlciBvZiBlbGVtZW50cyBpbiBhbiBvYmplY3QuXG4gIF8uc2l6ZSA9IGZ1bmN0aW9uKG9iaikge1xuICAgIGlmIChvYmogPT0gbnVsbCkgcmV0dXJuIDA7XG4gICAgcmV0dXJuIChvYmoubGVuZ3RoID09PSArb2JqLmxlbmd0aCkgPyBvYmoubGVuZ3RoIDogXy5rZXlzKG9iaikubGVuZ3RoO1xuICB9O1xuXG4gIC8vIEFycmF5IEZ1bmN0aW9uc1xuICAvLyAtLS0tLS0tLS0tLS0tLS1cblxuICAvLyBHZXQgdGhlIGZpcnN0IGVsZW1lbnQgb2YgYW4gYXJyYXkuIFBhc3NpbmcgKipuKiogd2lsbCByZXR1cm4gdGhlIGZpcnN0IE5cbiAgLy8gdmFsdWVzIGluIHRoZSBhcnJheS4gQWxpYXNlZCBhcyBgaGVhZGAgYW5kIGB0YWtlYC4gVGhlICoqZ3VhcmQqKiBjaGVja1xuICAvLyBhbGxvd3MgaXQgdG8gd29yayB3aXRoIGBfLm1hcGAuXG4gIF8uZmlyc3QgPSBfLmhlYWQgPSBfLnRha2UgPSBmdW5jdGlvbihhcnJheSwgbiwgZ3VhcmQpIHtcbiAgICBpZiAoYXJyYXkgPT0gbnVsbCkgcmV0dXJuIHZvaWQgMDtcbiAgICByZXR1cm4gKG4gPT0gbnVsbCkgfHwgZ3VhcmQgPyBhcnJheVswXSA6IHNsaWNlLmNhbGwoYXJyYXksIDAsIG4pO1xuICB9O1xuXG4gIC8vIFJldHVybnMgZXZlcnl0aGluZyBidXQgdGhlIGxhc3QgZW50cnkgb2YgdGhlIGFycmF5LiBFc3BlY2lhbGx5IHVzZWZ1bCBvblxuICAvLyB0aGUgYXJndW1lbnRzIG9iamVjdC4gUGFzc2luZyAqKm4qKiB3aWxsIHJldHVybiBhbGwgdGhlIHZhbHVlcyBpblxuICAvLyB0aGUgYXJyYXksIGV4Y2x1ZGluZyB0aGUgbGFzdCBOLiBUaGUgKipndWFyZCoqIGNoZWNrIGFsbG93cyBpdCB0byB3b3JrIHdpdGhcbiAgLy8gYF8ubWFwYC5cbiAgXy5pbml0aWFsID0gZnVuY3Rpb24oYXJyYXksIG4sIGd1YXJkKSB7XG4gICAgcmV0dXJuIHNsaWNlLmNhbGwoYXJyYXksIDAsIGFycmF5Lmxlbmd0aCAtICgobiA9PSBudWxsKSB8fCBndWFyZCA/IDEgOiBuKSk7XG4gIH07XG5cbiAgLy8gR2V0IHRoZSBsYXN0IGVsZW1lbnQgb2YgYW4gYXJyYXkuIFBhc3NpbmcgKipuKiogd2lsbCByZXR1cm4gdGhlIGxhc3QgTlxuICAvLyB2YWx1ZXMgaW4gdGhlIGFycmF5LiBUaGUgKipndWFyZCoqIGNoZWNrIGFsbG93cyBpdCB0byB3b3JrIHdpdGggYF8ubWFwYC5cbiAgXy5sYXN0ID0gZnVuY3Rpb24oYXJyYXksIG4sIGd1YXJkKSB7XG4gICAgaWYgKGFycmF5ID09IG51bGwpIHJldHVybiB2b2lkIDA7XG4gICAgaWYgKChuID09IG51bGwpIHx8IGd1YXJkKSB7XG4gICAgICByZXR1cm4gYXJyYXlbYXJyYXkubGVuZ3RoIC0gMV07XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBzbGljZS5jYWxsKGFycmF5LCBNYXRoLm1heChhcnJheS5sZW5ndGggLSBuLCAwKSk7XG4gICAgfVxuICB9O1xuXG4gIC8vIFJldHVybnMgZXZlcnl0aGluZyBidXQgdGhlIGZpcnN0IGVudHJ5IG9mIHRoZSBhcnJheS4gQWxpYXNlZCBhcyBgdGFpbGAgYW5kIGBkcm9wYC5cbiAgLy8gRXNwZWNpYWxseSB1c2VmdWwgb24gdGhlIGFyZ3VtZW50cyBvYmplY3QuIFBhc3NpbmcgYW4gKipuKiogd2lsbCByZXR1cm5cbiAgLy8gdGhlIHJlc3QgTiB2YWx1ZXMgaW4gdGhlIGFycmF5LiBUaGUgKipndWFyZCoqXG4gIC8vIGNoZWNrIGFsbG93cyBpdCB0byB3b3JrIHdpdGggYF8ubWFwYC5cbiAgXy5yZXN0ID0gXy50YWlsID0gXy5kcm9wID0gZnVuY3Rpb24oYXJyYXksIG4sIGd1YXJkKSB7XG4gICAgcmV0dXJuIHNsaWNlLmNhbGwoYXJyYXksIChuID09IG51bGwpIHx8IGd1YXJkID8gMSA6IG4pO1xuICB9O1xuXG4gIC8vIFRyaW0gb3V0IGFsbCBmYWxzeSB2YWx1ZXMgZnJvbSBhbiBhcnJheS5cbiAgXy5jb21wYWN0ID0gZnVuY3Rpb24oYXJyYXkpIHtcbiAgICByZXR1cm4gXy5maWx0ZXIoYXJyYXksIF8uaWRlbnRpdHkpO1xuICB9O1xuXG4gIC8vIEludGVybmFsIGltcGxlbWVudGF0aW9uIG9mIGEgcmVjdXJzaXZlIGBmbGF0dGVuYCBmdW5jdGlvbi5cbiAgdmFyIGZsYXR0ZW4gPSBmdW5jdGlvbihpbnB1dCwgc2hhbGxvdywgb3V0cHV0KSB7XG4gICAgaWYgKHNoYWxsb3cgJiYgXy5ldmVyeShpbnB1dCwgXy5pc0FycmF5KSkge1xuICAgICAgcmV0dXJuIGNvbmNhdC5hcHBseShvdXRwdXQsIGlucHV0KTtcbiAgICB9XG4gICAgZWFjaChpbnB1dCwgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIGlmIChfLmlzQXJyYXkodmFsdWUpIHx8IF8uaXNBcmd1bWVudHModmFsdWUpKSB7XG4gICAgICAgIHNoYWxsb3cgPyBwdXNoLmFwcGx5KG91dHB1dCwgdmFsdWUpIDogZmxhdHRlbih2YWx1ZSwgc2hhbGxvdywgb3V0cHV0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG91dHB1dC5wdXNoKHZhbHVlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gb3V0cHV0O1xuICB9O1xuXG4gIC8vIEZsYXR0ZW4gb3V0IGFuIGFycmF5LCBlaXRoZXIgcmVjdXJzaXZlbHkgKGJ5IGRlZmF1bHQpLCBvciBqdXN0IG9uZSBsZXZlbC5cbiAgXy5mbGF0dGVuID0gZnVuY3Rpb24oYXJyYXksIHNoYWxsb3cpIHtcbiAgICByZXR1cm4gZmxhdHRlbihhcnJheSwgc2hhbGxvdywgW10pO1xuICB9O1xuXG4gIC8vIFJldHVybiBhIHZlcnNpb24gb2YgdGhlIGFycmF5IHRoYXQgZG9lcyBub3QgY29udGFpbiB0aGUgc3BlY2lmaWVkIHZhbHVlKHMpLlxuICBfLndpdGhvdXQgPSBmdW5jdGlvbihhcnJheSkge1xuICAgIHJldHVybiBfLmRpZmZlcmVuY2UoYXJyYXksIHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSk7XG4gIH07XG5cbiAgLy8gUHJvZHVjZSBhIGR1cGxpY2F0ZS1mcmVlIHZlcnNpb24gb2YgdGhlIGFycmF5LiBJZiB0aGUgYXJyYXkgaGFzIGFscmVhZHlcbiAgLy8gYmVlbiBzb3J0ZWQsIHlvdSBoYXZlIHRoZSBvcHRpb24gb2YgdXNpbmcgYSBmYXN0ZXIgYWxnb3JpdGhtLlxuICAvLyBBbGlhc2VkIGFzIGB1bmlxdWVgLlxuICBfLnVuaXEgPSBfLnVuaXF1ZSA9IGZ1bmN0aW9uKGFycmF5LCBpc1NvcnRlZCwgaXRlcmF0b3IsIGNvbnRleHQpIHtcbiAgICBpZiAoXy5pc0Z1bmN0aW9uKGlzU29ydGVkKSkge1xuICAgICAgY29udGV4dCA9IGl0ZXJhdG9yO1xuICAgICAgaXRlcmF0b3IgPSBpc1NvcnRlZDtcbiAgICAgIGlzU29ydGVkID0gZmFsc2U7XG4gICAgfVxuICAgIHZhciBpbml0aWFsID0gaXRlcmF0b3IgPyBfLm1hcChhcnJheSwgaXRlcmF0b3IsIGNvbnRleHQpIDogYXJyYXk7XG4gICAgdmFyIHJlc3VsdHMgPSBbXTtcbiAgICB2YXIgc2VlbiA9IFtdO1xuICAgIGVhY2goaW5pdGlhbCwgZnVuY3Rpb24odmFsdWUsIGluZGV4KSB7XG4gICAgICBpZiAoaXNTb3J0ZWQgPyAoIWluZGV4IHx8IHNlZW5bc2Vlbi5sZW5ndGggLSAxXSAhPT0gdmFsdWUpIDogIV8uY29udGFpbnMoc2VlbiwgdmFsdWUpKSB7XG4gICAgICAgIHNlZW4ucHVzaCh2YWx1ZSk7XG4gICAgICAgIHJlc3VsdHMucHVzaChhcnJheVtpbmRleF0pO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiByZXN1bHRzO1xuICB9O1xuXG4gIC8vIFByb2R1Y2UgYW4gYXJyYXkgdGhhdCBjb250YWlucyB0aGUgdW5pb246IGVhY2ggZGlzdGluY3QgZWxlbWVudCBmcm9tIGFsbCBvZlxuICAvLyB0aGUgcGFzc2VkLWluIGFycmF5cy5cbiAgXy51bmlvbiA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBfLnVuaXEoXy5mbGF0dGVuKGFyZ3VtZW50cywgdHJ1ZSkpO1xuICB9O1xuXG4gIC8vIFByb2R1Y2UgYW4gYXJyYXkgdGhhdCBjb250YWlucyBldmVyeSBpdGVtIHNoYXJlZCBiZXR3ZWVuIGFsbCB0aGVcbiAgLy8gcGFzc2VkLWluIGFycmF5cy5cbiAgXy5pbnRlcnNlY3Rpb24gPSBmdW5jdGlvbihhcnJheSkge1xuICAgIHZhciByZXN0ID0gc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgIHJldHVybiBfLmZpbHRlcihfLnVuaXEoYXJyYXkpLCBmdW5jdGlvbihpdGVtKSB7XG4gICAgICByZXR1cm4gXy5ldmVyeShyZXN0LCBmdW5jdGlvbihvdGhlcikge1xuICAgICAgICByZXR1cm4gXy5pbmRleE9mKG90aGVyLCBpdGVtKSA+PSAwO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH07XG5cbiAgLy8gVGFrZSB0aGUgZGlmZmVyZW5jZSBiZXR3ZWVuIG9uZSBhcnJheSBhbmQgYSBudW1iZXIgb2Ygb3RoZXIgYXJyYXlzLlxuICAvLyBPbmx5IHRoZSBlbGVtZW50cyBwcmVzZW50IGluIGp1c3QgdGhlIGZpcnN0IGFycmF5IHdpbGwgcmVtYWluLlxuICBfLmRpZmZlcmVuY2UgPSBmdW5jdGlvbihhcnJheSkge1xuICAgIHZhciByZXN0ID0gY29uY2F0LmFwcGx5KEFycmF5UHJvdG8sIHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSk7XG4gICAgcmV0dXJuIF8uZmlsdGVyKGFycmF5LCBmdW5jdGlvbih2YWx1ZSl7IHJldHVybiAhXy5jb250YWlucyhyZXN0LCB2YWx1ZSk7IH0pO1xuICB9O1xuXG4gIC8vIFppcCB0b2dldGhlciBtdWx0aXBsZSBsaXN0cyBpbnRvIGEgc2luZ2xlIGFycmF5IC0tIGVsZW1lbnRzIHRoYXQgc2hhcmVcbiAgLy8gYW4gaW5kZXggZ28gdG9nZXRoZXIuXG4gIF8uemlwID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGxlbmd0aCA9IF8ubWF4KF8ucGx1Y2soYXJndW1lbnRzLCBcImxlbmd0aFwiKS5jb25jYXQoMCkpO1xuICAgIHZhciByZXN1bHRzID0gbmV3IEFycmF5KGxlbmd0aCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgcmVzdWx0c1tpXSA9IF8ucGx1Y2soYXJndW1lbnRzLCAnJyArIGkpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfTtcblxuICAvLyBDb252ZXJ0cyBsaXN0cyBpbnRvIG9iamVjdHMuIFBhc3MgZWl0aGVyIGEgc2luZ2xlIGFycmF5IG9mIGBba2V5LCB2YWx1ZV1gXG4gIC8vIHBhaXJzLCBvciB0d28gcGFyYWxsZWwgYXJyYXlzIG9mIHRoZSBzYW1lIGxlbmd0aCAtLSBvbmUgb2Yga2V5cywgYW5kIG9uZSBvZlxuICAvLyB0aGUgY29ycmVzcG9uZGluZyB2YWx1ZXMuXG4gIF8ub2JqZWN0ID0gZnVuY3Rpb24obGlzdCwgdmFsdWVzKSB7XG4gICAgaWYgKGxpc3QgPT0gbnVsbCkgcmV0dXJuIHt9O1xuICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gbGlzdC5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHZhbHVlcykge1xuICAgICAgICByZXN1bHRbbGlzdFtpXV0gPSB2YWx1ZXNbaV07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXN1bHRbbGlzdFtpXVswXV0gPSBsaXN0W2ldWzFdO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIC8vIElmIHRoZSBicm93c2VyIGRvZXNuJ3Qgc3VwcGx5IHVzIHdpdGggaW5kZXhPZiAoSSdtIGxvb2tpbmcgYXQgeW91LCAqKk1TSUUqKiksXG4gIC8vIHdlIG5lZWQgdGhpcyBmdW5jdGlvbi4gUmV0dXJuIHRoZSBwb3NpdGlvbiBvZiB0aGUgZmlyc3Qgb2NjdXJyZW5jZSBvZiBhblxuICAvLyBpdGVtIGluIGFuIGFycmF5LCBvciAtMSBpZiB0aGUgaXRlbSBpcyBub3QgaW5jbHVkZWQgaW4gdGhlIGFycmF5LlxuICAvLyBEZWxlZ2F0ZXMgdG8gKipFQ01BU2NyaXB0IDUqKidzIG5hdGl2ZSBgaW5kZXhPZmAgaWYgYXZhaWxhYmxlLlxuICAvLyBJZiB0aGUgYXJyYXkgaXMgbGFyZ2UgYW5kIGFscmVhZHkgaW4gc29ydCBvcmRlciwgcGFzcyBgdHJ1ZWBcbiAgLy8gZm9yICoqaXNTb3J0ZWQqKiB0byB1c2UgYmluYXJ5IHNlYXJjaC5cbiAgXy5pbmRleE9mID0gZnVuY3Rpb24oYXJyYXksIGl0ZW0sIGlzU29ydGVkKSB7XG4gICAgaWYgKGFycmF5ID09IG51bGwpIHJldHVybiAtMTtcbiAgICB2YXIgaSA9IDAsIGxlbmd0aCA9IGFycmF5Lmxlbmd0aDtcbiAgICBpZiAoaXNTb3J0ZWQpIHtcbiAgICAgIGlmICh0eXBlb2YgaXNTb3J0ZWQgPT0gJ251bWJlcicpIHtcbiAgICAgICAgaSA9IChpc1NvcnRlZCA8IDAgPyBNYXRoLm1heCgwLCBsZW5ndGggKyBpc1NvcnRlZCkgOiBpc1NvcnRlZCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpID0gXy5zb3J0ZWRJbmRleChhcnJheSwgaXRlbSk7XG4gICAgICAgIHJldHVybiBhcnJheVtpXSA9PT0gaXRlbSA/IGkgOiAtMTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKG5hdGl2ZUluZGV4T2YgJiYgYXJyYXkuaW5kZXhPZiA9PT0gbmF0aXZlSW5kZXhPZikgcmV0dXJuIGFycmF5LmluZGV4T2YoaXRlbSwgaXNTb3J0ZWQpO1xuICAgIGZvciAoOyBpIDwgbGVuZ3RoOyBpKyspIGlmIChhcnJheVtpXSA9PT0gaXRlbSkgcmV0dXJuIGk7XG4gICAgcmV0dXJuIC0xO1xuICB9O1xuXG4gIC8vIERlbGVnYXRlcyB0byAqKkVDTUFTY3JpcHQgNSoqJ3MgbmF0aXZlIGBsYXN0SW5kZXhPZmAgaWYgYXZhaWxhYmxlLlxuICBfLmxhc3RJbmRleE9mID0gZnVuY3Rpb24oYXJyYXksIGl0ZW0sIGZyb20pIHtcbiAgICBpZiAoYXJyYXkgPT0gbnVsbCkgcmV0dXJuIC0xO1xuICAgIHZhciBoYXNJbmRleCA9IGZyb20gIT0gbnVsbDtcbiAgICBpZiAobmF0aXZlTGFzdEluZGV4T2YgJiYgYXJyYXkubGFzdEluZGV4T2YgPT09IG5hdGl2ZUxhc3RJbmRleE9mKSB7XG4gICAgICByZXR1cm4gaGFzSW5kZXggPyBhcnJheS5sYXN0SW5kZXhPZihpdGVtLCBmcm9tKSA6IGFycmF5Lmxhc3RJbmRleE9mKGl0ZW0pO1xuICAgIH1cbiAgICB2YXIgaSA9IChoYXNJbmRleCA/IGZyb20gOiBhcnJheS5sZW5ndGgpO1xuICAgIHdoaWxlIChpLS0pIGlmIChhcnJheVtpXSA9PT0gaXRlbSkgcmV0dXJuIGk7XG4gICAgcmV0dXJuIC0xO1xuICB9O1xuXG4gIC8vIEdlbmVyYXRlIGFuIGludGVnZXIgQXJyYXkgY29udGFpbmluZyBhbiBhcml0aG1ldGljIHByb2dyZXNzaW9uLiBBIHBvcnQgb2ZcbiAgLy8gdGhlIG5hdGl2ZSBQeXRob24gYHJhbmdlKClgIGZ1bmN0aW9uLiBTZWVcbiAgLy8gW3RoZSBQeXRob24gZG9jdW1lbnRhdGlvbl0oaHR0cDovL2RvY3MucHl0aG9uLm9yZy9saWJyYXJ5L2Z1bmN0aW9ucy5odG1sI3JhbmdlKS5cbiAgXy5yYW5nZSA9IGZ1bmN0aW9uKHN0YXJ0LCBzdG9wLCBzdGVwKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPD0gMSkge1xuICAgICAgc3RvcCA9IHN0YXJ0IHx8IDA7XG4gICAgICBzdGFydCA9IDA7XG4gICAgfVxuICAgIHN0ZXAgPSBhcmd1bWVudHNbMl0gfHwgMTtcblxuICAgIHZhciBsZW5ndGggPSBNYXRoLm1heChNYXRoLmNlaWwoKHN0b3AgLSBzdGFydCkgLyBzdGVwKSwgMCk7XG4gICAgdmFyIGlkeCA9IDA7XG4gICAgdmFyIHJhbmdlID0gbmV3IEFycmF5KGxlbmd0aCk7XG5cbiAgICB3aGlsZShpZHggPCBsZW5ndGgpIHtcbiAgICAgIHJhbmdlW2lkeCsrXSA9IHN0YXJ0O1xuICAgICAgc3RhcnQgKz0gc3RlcDtcbiAgICB9XG5cbiAgICByZXR1cm4gcmFuZ2U7XG4gIH07XG5cbiAgLy8gRnVuY3Rpb24gKGFoZW0pIEZ1bmN0aW9uc1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvLyBSZXVzYWJsZSBjb25zdHJ1Y3RvciBmdW5jdGlvbiBmb3IgcHJvdG90eXBlIHNldHRpbmcuXG4gIHZhciBjdG9yID0gZnVuY3Rpb24oKXt9O1xuXG4gIC8vIENyZWF0ZSBhIGZ1bmN0aW9uIGJvdW5kIHRvIGEgZ2l2ZW4gb2JqZWN0IChhc3NpZ25pbmcgYHRoaXNgLCBhbmQgYXJndW1lbnRzLFxuICAvLyBvcHRpb25hbGx5KS4gRGVsZWdhdGVzIHRvICoqRUNNQVNjcmlwdCA1KioncyBuYXRpdmUgYEZ1bmN0aW9uLmJpbmRgIGlmXG4gIC8vIGF2YWlsYWJsZS5cbiAgXy5iaW5kID0gZnVuY3Rpb24oZnVuYywgY29udGV4dCkge1xuICAgIHZhciBhcmdzLCBib3VuZDtcbiAgICBpZiAobmF0aXZlQmluZCAmJiBmdW5jLmJpbmQgPT09IG5hdGl2ZUJpbmQpIHJldHVybiBuYXRpdmVCaW5kLmFwcGx5KGZ1bmMsIHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSk7XG4gICAgaWYgKCFfLmlzRnVuY3Rpb24oZnVuYykpIHRocm93IG5ldyBUeXBlRXJyb3I7XG4gICAgYXJncyA9IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAyKTtcbiAgICByZXR1cm4gYm91bmQgPSBmdW5jdGlvbigpIHtcbiAgICAgIGlmICghKHRoaXMgaW5zdGFuY2VvZiBib3VuZCkpIHJldHVybiBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MuY29uY2F0KHNsaWNlLmNhbGwoYXJndW1lbnRzKSkpO1xuICAgICAgY3Rvci5wcm90b3R5cGUgPSBmdW5jLnByb3RvdHlwZTtcbiAgICAgIHZhciBzZWxmID0gbmV3IGN0b3I7XG4gICAgICBjdG9yLnByb3RvdHlwZSA9IG51bGw7XG4gICAgICB2YXIgcmVzdWx0ID0gZnVuYy5hcHBseShzZWxmLCBhcmdzLmNvbmNhdChzbGljZS5jYWxsKGFyZ3VtZW50cykpKTtcbiAgICAgIGlmIChPYmplY3QocmVzdWx0KSA9PT0gcmVzdWx0KSByZXR1cm4gcmVzdWx0O1xuICAgICAgcmV0dXJuIHNlbGY7XG4gICAgfTtcbiAgfTtcblxuICAvLyBQYXJ0aWFsbHkgYXBwbHkgYSBmdW5jdGlvbiBieSBjcmVhdGluZyBhIHZlcnNpb24gdGhhdCBoYXMgaGFkIHNvbWUgb2YgaXRzXG4gIC8vIGFyZ3VtZW50cyBwcmUtZmlsbGVkLCB3aXRob3V0IGNoYW5naW5nIGl0cyBkeW5hbWljIGB0aGlzYCBjb250ZXh0LlxuICBfLnBhcnRpYWwgPSBmdW5jdGlvbihmdW5jKSB7XG4gICAgdmFyIGFyZ3MgPSBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGZ1bmMuYXBwbHkodGhpcywgYXJncy5jb25jYXQoc2xpY2UuY2FsbChhcmd1bWVudHMpKSk7XG4gICAgfTtcbiAgfTtcblxuICAvLyBCaW5kIGFsbCBvZiBhbiBvYmplY3QncyBtZXRob2RzIHRvIHRoYXQgb2JqZWN0LiBVc2VmdWwgZm9yIGVuc3VyaW5nIHRoYXRcbiAgLy8gYWxsIGNhbGxiYWNrcyBkZWZpbmVkIG9uIGFuIG9iamVjdCBiZWxvbmcgdG8gaXQuXG4gIF8uYmluZEFsbCA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciBmdW5jcyA9IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICBpZiAoZnVuY3MubGVuZ3RoID09PSAwKSB0aHJvdyBuZXcgRXJyb3IoXCJiaW5kQWxsIG11c3QgYmUgcGFzc2VkIGZ1bmN0aW9uIG5hbWVzXCIpO1xuICAgIGVhY2goZnVuY3MsIGZ1bmN0aW9uKGYpIHsgb2JqW2ZdID0gXy5iaW5kKG9ialtmXSwgb2JqKTsgfSk7XG4gICAgcmV0dXJuIG9iajtcbiAgfTtcblxuICAvLyBNZW1vaXplIGFuIGV4cGVuc2l2ZSBmdW5jdGlvbiBieSBzdG9yaW5nIGl0cyByZXN1bHRzLlxuICBfLm1lbW9pemUgPSBmdW5jdGlvbihmdW5jLCBoYXNoZXIpIHtcbiAgICB2YXIgbWVtbyA9IHt9O1xuICAgIGhhc2hlciB8fCAoaGFzaGVyID0gXy5pZGVudGl0eSk7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGtleSA9IGhhc2hlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgcmV0dXJuIF8uaGFzKG1lbW8sIGtleSkgPyBtZW1vW2tleV0gOiAobWVtb1trZXldID0gZnVuYy5hcHBseSh0aGlzLCBhcmd1bWVudHMpKTtcbiAgICB9O1xuICB9O1xuXG4gIC8vIERlbGF5cyBhIGZ1bmN0aW9uIGZvciB0aGUgZ2l2ZW4gbnVtYmVyIG9mIG1pbGxpc2Vjb25kcywgYW5kIHRoZW4gY2FsbHNcbiAgLy8gaXQgd2l0aCB0aGUgYXJndW1lbnRzIHN1cHBsaWVkLlxuICBfLmRlbGF5ID0gZnVuY3Rpb24oZnVuYywgd2FpdCkge1xuICAgIHZhciBhcmdzID0gc2xpY2UuY2FsbChhcmd1bWVudHMsIDIpO1xuICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7IHJldHVybiBmdW5jLmFwcGx5KG51bGwsIGFyZ3MpOyB9LCB3YWl0KTtcbiAgfTtcblxuICAvLyBEZWZlcnMgYSBmdW5jdGlvbiwgc2NoZWR1bGluZyBpdCB0byBydW4gYWZ0ZXIgdGhlIGN1cnJlbnQgY2FsbCBzdGFjayBoYXNcbiAgLy8gY2xlYXJlZC5cbiAgXy5kZWZlciA9IGZ1bmN0aW9uKGZ1bmMpIHtcbiAgICByZXR1cm4gXy5kZWxheS5hcHBseShfLCBbZnVuYywgMV0uY29uY2F0KHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSkpO1xuICB9O1xuXG4gIC8vIFJldHVybnMgYSBmdW5jdGlvbiwgdGhhdCwgd2hlbiBpbnZva2VkLCB3aWxsIG9ubHkgYmUgdHJpZ2dlcmVkIGF0IG1vc3Qgb25jZVxuICAvLyBkdXJpbmcgYSBnaXZlbiB3aW5kb3cgb2YgdGltZS4gTm9ybWFsbHksIHRoZSB0aHJvdHRsZWQgZnVuY3Rpb24gd2lsbCBydW5cbiAgLy8gYXMgbXVjaCBhcyBpdCBjYW4sIHdpdGhvdXQgZXZlciBnb2luZyBtb3JlIHRoYW4gb25jZSBwZXIgYHdhaXRgIGR1cmF0aW9uO1xuICAvLyBidXQgaWYgeW91J2QgbGlrZSB0byBkaXNhYmxlIHRoZSBleGVjdXRpb24gb24gdGhlIGxlYWRpbmcgZWRnZSwgcGFzc1xuICAvLyBge2xlYWRpbmc6IGZhbHNlfWAuIFRvIGRpc2FibGUgZXhlY3V0aW9uIG9uIHRoZSB0cmFpbGluZyBlZGdlLCBkaXR0by5cbiAgXy50aHJvdHRsZSA9IGZ1bmN0aW9uKGZ1bmMsIHdhaXQsIG9wdGlvbnMpIHtcbiAgICB2YXIgY29udGV4dCwgYXJncywgcmVzdWx0O1xuICAgIHZhciB0aW1lb3V0ID0gbnVsbDtcbiAgICB2YXIgcHJldmlvdXMgPSAwO1xuICAgIG9wdGlvbnMgfHwgKG9wdGlvbnMgPSB7fSk7XG4gICAgdmFyIGxhdGVyID0gZnVuY3Rpb24oKSB7XG4gICAgICBwcmV2aW91cyA9IG9wdGlvbnMubGVhZGluZyA9PT0gZmFsc2UgPyAwIDogbmV3IERhdGU7XG4gICAgICB0aW1lb3V0ID0gbnVsbDtcbiAgICAgIHJlc3VsdCA9IGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgfTtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgbm93ID0gbmV3IERhdGU7XG4gICAgICBpZiAoIXByZXZpb3VzICYmIG9wdGlvbnMubGVhZGluZyA9PT0gZmFsc2UpIHByZXZpb3VzID0gbm93O1xuICAgICAgdmFyIHJlbWFpbmluZyA9IHdhaXQgLSAobm93IC0gcHJldmlvdXMpO1xuICAgICAgY29udGV4dCA9IHRoaXM7XG4gICAgICBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgaWYgKHJlbWFpbmluZyA8PSAwKSB7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICAgICAgdGltZW91dCA9IG51bGw7XG4gICAgICAgIHByZXZpb3VzID0gbm93O1xuICAgICAgICByZXN1bHQgPSBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgfSBlbHNlIGlmICghdGltZW91dCAmJiBvcHRpb25zLnRyYWlsaW5nICE9PSBmYWxzZSkge1xuICAgICAgICB0aW1lb3V0ID0gc2V0VGltZW91dChsYXRlciwgcmVtYWluaW5nKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGEgZnVuY3Rpb24sIHRoYXQsIGFzIGxvbmcgYXMgaXQgY29udGludWVzIHRvIGJlIGludm9rZWQsIHdpbGwgbm90XG4gIC8vIGJlIHRyaWdnZXJlZC4gVGhlIGZ1bmN0aW9uIHdpbGwgYmUgY2FsbGVkIGFmdGVyIGl0IHN0b3BzIGJlaW5nIGNhbGxlZCBmb3JcbiAgLy8gTiBtaWxsaXNlY29uZHMuIElmIGBpbW1lZGlhdGVgIGlzIHBhc3NlZCwgdHJpZ2dlciB0aGUgZnVuY3Rpb24gb24gdGhlXG4gIC8vIGxlYWRpbmcgZWRnZSwgaW5zdGVhZCBvZiB0aGUgdHJhaWxpbmcuXG4gIF8uZGVib3VuY2UgPSBmdW5jdGlvbihmdW5jLCB3YWl0LCBpbW1lZGlhdGUpIHtcbiAgICB2YXIgdGltZW91dCwgYXJncywgY29udGV4dCwgdGltZXN0YW1wLCByZXN1bHQ7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgY29udGV4dCA9IHRoaXM7XG4gICAgICBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgdGltZXN0YW1wID0gbmV3IERhdGUoKTtcbiAgICAgIHZhciBsYXRlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgbGFzdCA9IChuZXcgRGF0ZSgpKSAtIHRpbWVzdGFtcDtcbiAgICAgICAgaWYgKGxhc3QgPCB3YWl0KSB7XG4gICAgICAgICAgdGltZW91dCA9IHNldFRpbWVvdXQobGF0ZXIsIHdhaXQgLSBsYXN0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aW1lb3V0ID0gbnVsbDtcbiAgICAgICAgICBpZiAoIWltbWVkaWF0ZSkgcmVzdWx0ID0gZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIHZhciBjYWxsTm93ID0gaW1tZWRpYXRlICYmICF0aW1lb3V0O1xuICAgICAgaWYgKCF0aW1lb3V0KSB7XG4gICAgICAgIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGxhdGVyLCB3YWl0KTtcbiAgICAgIH1cbiAgICAgIGlmIChjYWxsTm93KSByZXN1bHQgPSBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuICB9O1xuXG4gIC8vIFJldHVybnMgYSBmdW5jdGlvbiB0aGF0IHdpbGwgYmUgZXhlY3V0ZWQgYXQgbW9zdCBvbmUgdGltZSwgbm8gbWF0dGVyIGhvd1xuICAvLyBvZnRlbiB5b3UgY2FsbCBpdC4gVXNlZnVsIGZvciBsYXp5IGluaXRpYWxpemF0aW9uLlxuICBfLm9uY2UgPSBmdW5jdGlvbihmdW5jKSB7XG4gICAgdmFyIHJhbiA9IGZhbHNlLCBtZW1vO1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIGlmIChyYW4pIHJldHVybiBtZW1vO1xuICAgICAgcmFuID0gdHJ1ZTtcbiAgICAgIG1lbW8gPSBmdW5jLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICBmdW5jID0gbnVsbDtcbiAgICAgIHJldHVybiBtZW1vO1xuICAgIH07XG4gIH07XG5cbiAgLy8gUmV0dXJucyB0aGUgZmlyc3QgZnVuY3Rpb24gcGFzc2VkIGFzIGFuIGFyZ3VtZW50IHRvIHRoZSBzZWNvbmQsXG4gIC8vIGFsbG93aW5nIHlvdSB0byBhZGp1c3QgYXJndW1lbnRzLCBydW4gY29kZSBiZWZvcmUgYW5kIGFmdGVyLCBhbmRcbiAgLy8gY29uZGl0aW9uYWxseSBleGVjdXRlIHRoZSBvcmlnaW5hbCBmdW5jdGlvbi5cbiAgXy53cmFwID0gZnVuY3Rpb24oZnVuYywgd3JhcHBlcikge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBhcmdzID0gW2Z1bmNdO1xuICAgICAgcHVzaC5hcHBseShhcmdzLCBhcmd1bWVudHMpO1xuICAgICAgcmV0dXJuIHdyYXBwZXIuYXBwbHkodGhpcywgYXJncyk7XG4gICAgfTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGEgZnVuY3Rpb24gdGhhdCBpcyB0aGUgY29tcG9zaXRpb24gb2YgYSBsaXN0IG9mIGZ1bmN0aW9ucywgZWFjaFxuICAvLyBjb25zdW1pbmcgdGhlIHJldHVybiB2YWx1ZSBvZiB0aGUgZnVuY3Rpb24gdGhhdCBmb2xsb3dzLlxuICBfLmNvbXBvc2UgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgZnVuY3MgPSBhcmd1bWVudHM7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICBmb3IgKHZhciBpID0gZnVuY3MubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgYXJncyA9IFtmdW5jc1tpXS5hcHBseSh0aGlzLCBhcmdzKV07XG4gICAgICB9XG4gICAgICByZXR1cm4gYXJnc1swXTtcbiAgICB9O1xuICB9O1xuXG4gIC8vIFJldHVybnMgYSBmdW5jdGlvbiB0aGF0IHdpbGwgb25seSBiZSBleGVjdXRlZCBhZnRlciBiZWluZyBjYWxsZWQgTiB0aW1lcy5cbiAgXy5hZnRlciA9IGZ1bmN0aW9uKHRpbWVzLCBmdW5jKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKC0tdGltZXMgPCAxKSB7XG4gICAgICAgIHJldHVybiBmdW5jLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICB9XG4gICAgfTtcbiAgfTtcblxuICAvLyBPYmplY3QgRnVuY3Rpb25zXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS1cblxuICAvLyBSZXRyaWV2ZSB0aGUgbmFtZXMgb2YgYW4gb2JqZWN0J3MgcHJvcGVydGllcy5cbiAgLy8gRGVsZWdhdGVzIHRvICoqRUNNQVNjcmlwdCA1KioncyBuYXRpdmUgYE9iamVjdC5rZXlzYFxuICBfLmtleXMgPSBuYXRpdmVLZXlzIHx8IGZ1bmN0aW9uKG9iaikge1xuICAgIGlmIChvYmogIT09IE9iamVjdChvYmopKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdJbnZhbGlkIG9iamVjdCcpO1xuICAgIHZhciBrZXlzID0gW107XG4gICAgZm9yICh2YXIga2V5IGluIG9iaikgaWYgKF8uaGFzKG9iaiwga2V5KSkga2V5cy5wdXNoKGtleSk7XG4gICAgcmV0dXJuIGtleXM7XG4gIH07XG5cbiAgLy8gUmV0cmlldmUgdGhlIHZhbHVlcyBvZiBhbiBvYmplY3QncyBwcm9wZXJ0aWVzLlxuICBfLnZhbHVlcyA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciBrZXlzID0gXy5rZXlzKG9iaik7XG4gICAgdmFyIGxlbmd0aCA9IGtleXMubGVuZ3RoO1xuICAgIHZhciB2YWx1ZXMgPSBuZXcgQXJyYXkobGVuZ3RoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICB2YWx1ZXNbaV0gPSBvYmpba2V5c1tpXV07XG4gICAgfVxuICAgIHJldHVybiB2YWx1ZXM7XG4gIH07XG5cbiAgLy8gQ29udmVydCBhbiBvYmplY3QgaW50byBhIGxpc3Qgb2YgYFtrZXksIHZhbHVlXWAgcGFpcnMuXG4gIF8ucGFpcnMgPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIga2V5cyA9IF8ua2V5cyhvYmopO1xuICAgIHZhciBsZW5ndGggPSBrZXlzLmxlbmd0aDtcbiAgICB2YXIgcGFpcnMgPSBuZXcgQXJyYXkobGVuZ3RoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBwYWlyc1tpXSA9IFtrZXlzW2ldLCBvYmpba2V5c1tpXV1dO1xuICAgIH1cbiAgICByZXR1cm4gcGFpcnM7XG4gIH07XG5cbiAgLy8gSW52ZXJ0IHRoZSBrZXlzIGFuZCB2YWx1ZXMgb2YgYW4gb2JqZWN0LiBUaGUgdmFsdWVzIG11c3QgYmUgc2VyaWFsaXphYmxlLlxuICBfLmludmVydCA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICB2YXIga2V5cyA9IF8ua2V5cyhvYmopO1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBrZXlzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICByZXN1bHRbb2JqW2tleXNbaV1dXSA9IGtleXNbaV07XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgLy8gUmV0dXJuIGEgc29ydGVkIGxpc3Qgb2YgdGhlIGZ1bmN0aW9uIG5hbWVzIGF2YWlsYWJsZSBvbiB0aGUgb2JqZWN0LlxuICAvLyBBbGlhc2VkIGFzIGBtZXRob2RzYFxuICBfLmZ1bmN0aW9ucyA9IF8ubWV0aG9kcyA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciBuYW1lcyA9IFtdO1xuICAgIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICAgIGlmIChfLmlzRnVuY3Rpb24ob2JqW2tleV0pKSBuYW1lcy5wdXNoKGtleSk7XG4gICAgfVxuICAgIHJldHVybiBuYW1lcy5zb3J0KCk7XG4gIH07XG5cbiAgLy8gRXh0ZW5kIGEgZ2l2ZW4gb2JqZWN0IHdpdGggYWxsIHRoZSBwcm9wZXJ0aWVzIGluIHBhc3NlZC1pbiBvYmplY3QocykuXG4gIF8uZXh0ZW5kID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgZWFjaChzbGljZS5jYWxsKGFyZ3VtZW50cywgMSksIGZ1bmN0aW9uKHNvdXJjZSkge1xuICAgICAgaWYgKHNvdXJjZSkge1xuICAgICAgICBmb3IgKHZhciBwcm9wIGluIHNvdXJjZSkge1xuICAgICAgICAgIG9ialtwcm9wXSA9IHNvdXJjZVtwcm9wXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBvYmo7XG4gIH07XG5cbiAgLy8gUmV0dXJuIGEgY29weSBvZiB0aGUgb2JqZWN0IG9ubHkgY29udGFpbmluZyB0aGUgd2hpdGVsaXN0ZWQgcHJvcGVydGllcy5cbiAgXy5waWNrID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIGNvcHkgPSB7fTtcbiAgICB2YXIga2V5cyA9IGNvbmNhdC5hcHBseShBcnJheVByb3RvLCBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSkpO1xuICAgIGVhY2goa2V5cywgZnVuY3Rpb24oa2V5KSB7XG4gICAgICBpZiAoa2V5IGluIG9iaikgY29weVtrZXldID0gb2JqW2tleV07XG4gICAgfSk7XG4gICAgcmV0dXJuIGNvcHk7XG4gIH07XG5cbiAgIC8vIFJldHVybiBhIGNvcHkgb2YgdGhlIG9iamVjdCB3aXRob3V0IHRoZSBibGFja2xpc3RlZCBwcm9wZXJ0aWVzLlxuICBfLm9taXQgPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIgY29weSA9IHt9O1xuICAgIHZhciBrZXlzID0gY29uY2F0LmFwcGx5KEFycmF5UHJvdG8sIHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSk7XG4gICAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgICAgaWYgKCFfLmNvbnRhaW5zKGtleXMsIGtleSkpIGNvcHlba2V5XSA9IG9ialtrZXldO1xuICAgIH1cbiAgICByZXR1cm4gY29weTtcbiAgfTtcblxuICAvLyBGaWxsIGluIGEgZ2l2ZW4gb2JqZWN0IHdpdGggZGVmYXVsdCBwcm9wZXJ0aWVzLlxuICBfLmRlZmF1bHRzID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgZWFjaChzbGljZS5jYWxsKGFyZ3VtZW50cywgMSksIGZ1bmN0aW9uKHNvdXJjZSkge1xuICAgICAgaWYgKHNvdXJjZSkge1xuICAgICAgICBmb3IgKHZhciBwcm9wIGluIHNvdXJjZSkge1xuICAgICAgICAgIGlmIChvYmpbcHJvcF0gPT09IHZvaWQgMCkgb2JqW3Byb3BdID0gc291cmNlW3Byb3BdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIG9iajtcbiAgfTtcblxuICAvLyBDcmVhdGUgYSAoc2hhbGxvdy1jbG9uZWQpIGR1cGxpY2F0ZSBvZiBhbiBvYmplY3QuXG4gIF8uY2xvbmUgPSBmdW5jdGlvbihvYmopIHtcbiAgICBpZiAoIV8uaXNPYmplY3Qob2JqKSkgcmV0dXJuIG9iajtcbiAgICByZXR1cm4gXy5pc0FycmF5KG9iaikgPyBvYmouc2xpY2UoKSA6IF8uZXh0ZW5kKHt9LCBvYmopO1xuICB9O1xuXG4gIC8vIEludm9rZXMgaW50ZXJjZXB0b3Igd2l0aCB0aGUgb2JqLCBhbmQgdGhlbiByZXR1cm5zIG9iai5cbiAgLy8gVGhlIHByaW1hcnkgcHVycG9zZSBvZiB0aGlzIG1ldGhvZCBpcyB0byBcInRhcCBpbnRvXCIgYSBtZXRob2QgY2hhaW4sIGluXG4gIC8vIG9yZGVyIHRvIHBlcmZvcm0gb3BlcmF0aW9ucyBvbiBpbnRlcm1lZGlhdGUgcmVzdWx0cyB3aXRoaW4gdGhlIGNoYWluLlxuICBfLnRhcCA9IGZ1bmN0aW9uKG9iaiwgaW50ZXJjZXB0b3IpIHtcbiAgICBpbnRlcmNlcHRvcihvYmopO1xuICAgIHJldHVybiBvYmo7XG4gIH07XG5cbiAgLy8gSW50ZXJuYWwgcmVjdXJzaXZlIGNvbXBhcmlzb24gZnVuY3Rpb24gZm9yIGBpc0VxdWFsYC5cbiAgdmFyIGVxID0gZnVuY3Rpb24oYSwgYiwgYVN0YWNrLCBiU3RhY2spIHtcbiAgICAvLyBJZGVudGljYWwgb2JqZWN0cyBhcmUgZXF1YWwuIGAwID09PSAtMGAsIGJ1dCB0aGV5IGFyZW4ndCBpZGVudGljYWwuXG4gICAgLy8gU2VlIHRoZSBbSGFybW9ueSBgZWdhbGAgcHJvcG9zYWxdKGh0dHA6Ly93aWtpLmVjbWFzY3JpcHQub3JnL2Rva3UucGhwP2lkPWhhcm1vbnk6ZWdhbCkuXG4gICAgaWYgKGEgPT09IGIpIHJldHVybiBhICE9PSAwIHx8IDEgLyBhID09IDEgLyBiO1xuICAgIC8vIEEgc3RyaWN0IGNvbXBhcmlzb24gaXMgbmVjZXNzYXJ5IGJlY2F1c2UgYG51bGwgPT0gdW5kZWZpbmVkYC5cbiAgICBpZiAoYSA9PSBudWxsIHx8IGIgPT0gbnVsbCkgcmV0dXJuIGEgPT09IGI7XG4gICAgLy8gVW53cmFwIGFueSB3cmFwcGVkIG9iamVjdHMuXG4gICAgaWYgKGEgaW5zdGFuY2VvZiBfKSBhID0gYS5fd3JhcHBlZDtcbiAgICBpZiAoYiBpbnN0YW5jZW9mIF8pIGIgPSBiLl93cmFwcGVkO1xuICAgIC8vIENvbXBhcmUgYFtbQ2xhc3NdXWAgbmFtZXMuXG4gICAgdmFyIGNsYXNzTmFtZSA9IHRvU3RyaW5nLmNhbGwoYSk7XG4gICAgaWYgKGNsYXNzTmFtZSAhPSB0b1N0cmluZy5jYWxsKGIpKSByZXR1cm4gZmFsc2U7XG4gICAgc3dpdGNoIChjbGFzc05hbWUpIHtcbiAgICAgIC8vIFN0cmluZ3MsIG51bWJlcnMsIGRhdGVzLCBhbmQgYm9vbGVhbnMgYXJlIGNvbXBhcmVkIGJ5IHZhbHVlLlxuICAgICAgY2FzZSAnW29iamVjdCBTdHJpbmddJzpcbiAgICAgICAgLy8gUHJpbWl0aXZlcyBhbmQgdGhlaXIgY29ycmVzcG9uZGluZyBvYmplY3Qgd3JhcHBlcnMgYXJlIGVxdWl2YWxlbnQ7IHRodXMsIGBcIjVcImAgaXNcbiAgICAgICAgLy8gZXF1aXZhbGVudCB0byBgbmV3IFN0cmluZyhcIjVcIilgLlxuICAgICAgICByZXR1cm4gYSA9PSBTdHJpbmcoYik7XG4gICAgICBjYXNlICdbb2JqZWN0IE51bWJlcl0nOlxuICAgICAgICAvLyBgTmFOYHMgYXJlIGVxdWl2YWxlbnQsIGJ1dCBub24tcmVmbGV4aXZlLiBBbiBgZWdhbGAgY29tcGFyaXNvbiBpcyBwZXJmb3JtZWQgZm9yXG4gICAgICAgIC8vIG90aGVyIG51bWVyaWMgdmFsdWVzLlxuICAgICAgICByZXR1cm4gYSAhPSArYSA/IGIgIT0gK2IgOiAoYSA9PSAwID8gMSAvIGEgPT0gMSAvIGIgOiBhID09ICtiKTtcbiAgICAgIGNhc2UgJ1tvYmplY3QgRGF0ZV0nOlxuICAgICAgY2FzZSAnW29iamVjdCBCb29sZWFuXSc6XG4gICAgICAgIC8vIENvZXJjZSBkYXRlcyBhbmQgYm9vbGVhbnMgdG8gbnVtZXJpYyBwcmltaXRpdmUgdmFsdWVzLiBEYXRlcyBhcmUgY29tcGFyZWQgYnkgdGhlaXJcbiAgICAgICAgLy8gbWlsbGlzZWNvbmQgcmVwcmVzZW50YXRpb25zLiBOb3RlIHRoYXQgaW52YWxpZCBkYXRlcyB3aXRoIG1pbGxpc2Vjb25kIHJlcHJlc2VudGF0aW9uc1xuICAgICAgICAvLyBvZiBgTmFOYCBhcmUgbm90IGVxdWl2YWxlbnQuXG4gICAgICAgIHJldHVybiArYSA9PSArYjtcbiAgICAgIC8vIFJlZ0V4cHMgYXJlIGNvbXBhcmVkIGJ5IHRoZWlyIHNvdXJjZSBwYXR0ZXJucyBhbmQgZmxhZ3MuXG4gICAgICBjYXNlICdbb2JqZWN0IFJlZ0V4cF0nOlxuICAgICAgICByZXR1cm4gYS5zb3VyY2UgPT0gYi5zb3VyY2UgJiZcbiAgICAgICAgICAgICAgIGEuZ2xvYmFsID09IGIuZ2xvYmFsICYmXG4gICAgICAgICAgICAgICBhLm11bHRpbGluZSA9PSBiLm11bHRpbGluZSAmJlxuICAgICAgICAgICAgICAgYS5pZ25vcmVDYXNlID09IGIuaWdub3JlQ2FzZTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBhICE9ICdvYmplY3QnIHx8IHR5cGVvZiBiICE9ICdvYmplY3QnKSByZXR1cm4gZmFsc2U7XG4gICAgLy8gQXNzdW1lIGVxdWFsaXR5IGZvciBjeWNsaWMgc3RydWN0dXJlcy4gVGhlIGFsZ29yaXRobSBmb3IgZGV0ZWN0aW5nIGN5Y2xpY1xuICAgIC8vIHN0cnVjdHVyZXMgaXMgYWRhcHRlZCBmcm9tIEVTIDUuMSBzZWN0aW9uIDE1LjEyLjMsIGFic3RyYWN0IG9wZXJhdGlvbiBgSk9gLlxuICAgIHZhciBsZW5ndGggPSBhU3RhY2subGVuZ3RoO1xuICAgIHdoaWxlIChsZW5ndGgtLSkge1xuICAgICAgLy8gTGluZWFyIHNlYXJjaC4gUGVyZm9ybWFuY2UgaXMgaW52ZXJzZWx5IHByb3BvcnRpb25hbCB0byB0aGUgbnVtYmVyIG9mXG4gICAgICAvLyB1bmlxdWUgbmVzdGVkIHN0cnVjdHVyZXMuXG4gICAgICBpZiAoYVN0YWNrW2xlbmd0aF0gPT0gYSkgcmV0dXJuIGJTdGFja1tsZW5ndGhdID09IGI7XG4gICAgfVxuICAgIC8vIE9iamVjdHMgd2l0aCBkaWZmZXJlbnQgY29uc3RydWN0b3JzIGFyZSBub3QgZXF1aXZhbGVudCwgYnV0IGBPYmplY3Rgc1xuICAgIC8vIGZyb20gZGlmZmVyZW50IGZyYW1lcyBhcmUuXG4gICAgdmFyIGFDdG9yID0gYS5jb25zdHJ1Y3RvciwgYkN0b3IgPSBiLmNvbnN0cnVjdG9yO1xuICAgIGlmIChhQ3RvciAhPT0gYkN0b3IgJiYgIShfLmlzRnVuY3Rpb24oYUN0b3IpICYmIChhQ3RvciBpbnN0YW5jZW9mIGFDdG9yKSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLmlzRnVuY3Rpb24oYkN0b3IpICYmIChiQ3RvciBpbnN0YW5jZW9mIGJDdG9yKSkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgLy8gQWRkIHRoZSBmaXJzdCBvYmplY3QgdG8gdGhlIHN0YWNrIG9mIHRyYXZlcnNlZCBvYmplY3RzLlxuICAgIGFTdGFjay5wdXNoKGEpO1xuICAgIGJTdGFjay5wdXNoKGIpO1xuICAgIHZhciBzaXplID0gMCwgcmVzdWx0ID0gdHJ1ZTtcbiAgICAvLyBSZWN1cnNpdmVseSBjb21wYXJlIG9iamVjdHMgYW5kIGFycmF5cy5cbiAgICBpZiAoY2xhc3NOYW1lID09ICdbb2JqZWN0IEFycmF5XScpIHtcbiAgICAgIC8vIENvbXBhcmUgYXJyYXkgbGVuZ3RocyB0byBkZXRlcm1pbmUgaWYgYSBkZWVwIGNvbXBhcmlzb24gaXMgbmVjZXNzYXJ5LlxuICAgICAgc2l6ZSA9IGEubGVuZ3RoO1xuICAgICAgcmVzdWx0ID0gc2l6ZSA9PSBiLmxlbmd0aDtcbiAgICAgIGlmIChyZXN1bHQpIHtcbiAgICAgICAgLy8gRGVlcCBjb21wYXJlIHRoZSBjb250ZW50cywgaWdub3Jpbmcgbm9uLW51bWVyaWMgcHJvcGVydGllcy5cbiAgICAgICAgd2hpbGUgKHNpemUtLSkge1xuICAgICAgICAgIGlmICghKHJlc3VsdCA9IGVxKGFbc2l6ZV0sIGJbc2l6ZV0sIGFTdGFjaywgYlN0YWNrKSkpIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIERlZXAgY29tcGFyZSBvYmplY3RzLlxuICAgICAgZm9yICh2YXIga2V5IGluIGEpIHtcbiAgICAgICAgaWYgKF8uaGFzKGEsIGtleSkpIHtcbiAgICAgICAgICAvLyBDb3VudCB0aGUgZXhwZWN0ZWQgbnVtYmVyIG9mIHByb3BlcnRpZXMuXG4gICAgICAgICAgc2l6ZSsrO1xuICAgICAgICAgIC8vIERlZXAgY29tcGFyZSBlYWNoIG1lbWJlci5cbiAgICAgICAgICBpZiAoIShyZXN1bHQgPSBfLmhhcyhiLCBrZXkpICYmIGVxKGFba2V5XSwgYltrZXldLCBhU3RhY2ssIGJTdGFjaykpKSBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy8gRW5zdXJlIHRoYXQgYm90aCBvYmplY3RzIGNvbnRhaW4gdGhlIHNhbWUgbnVtYmVyIG9mIHByb3BlcnRpZXMuXG4gICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgIGZvciAoa2V5IGluIGIpIHtcbiAgICAgICAgICBpZiAoXy5oYXMoYiwga2V5KSAmJiAhKHNpemUtLSkpIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIHJlc3VsdCA9ICFzaXplO1xuICAgICAgfVxuICAgIH1cbiAgICAvLyBSZW1vdmUgdGhlIGZpcnN0IG9iamVjdCBmcm9tIHRoZSBzdGFjayBvZiB0cmF2ZXJzZWQgb2JqZWN0cy5cbiAgICBhU3RhY2sucG9wKCk7XG4gICAgYlN0YWNrLnBvcCgpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgLy8gUGVyZm9ybSBhIGRlZXAgY29tcGFyaXNvbiB0byBjaGVjayBpZiB0d28gb2JqZWN0cyBhcmUgZXF1YWwuXG4gIF8uaXNFcXVhbCA9IGZ1bmN0aW9uKGEsIGIpIHtcbiAgICByZXR1cm4gZXEoYSwgYiwgW10sIFtdKTtcbiAgfTtcblxuICAvLyBJcyBhIGdpdmVuIGFycmF5LCBzdHJpbmcsIG9yIG9iamVjdCBlbXB0eT9cbiAgLy8gQW4gXCJlbXB0eVwiIG9iamVjdCBoYXMgbm8gZW51bWVyYWJsZSBvd24tcHJvcGVydGllcy5cbiAgXy5pc0VtcHR5ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gdHJ1ZTtcbiAgICBpZiAoXy5pc0FycmF5KG9iaikgfHwgXy5pc1N0cmluZyhvYmopKSByZXR1cm4gb2JqLmxlbmd0aCA9PT0gMDtcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSBpZiAoXy5oYXMob2JqLCBrZXkpKSByZXR1cm4gZmFsc2U7XG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG5cbiAgLy8gSXMgYSBnaXZlbiB2YWx1ZSBhIERPTSBlbGVtZW50P1xuICBfLmlzRWxlbWVudCA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiAhIShvYmogJiYgb2JqLm5vZGVUeXBlID09PSAxKTtcbiAgfTtcblxuICAvLyBJcyBhIGdpdmVuIHZhbHVlIGFuIGFycmF5P1xuICAvLyBEZWxlZ2F0ZXMgdG8gRUNNQTUncyBuYXRpdmUgQXJyYXkuaXNBcnJheVxuICBfLmlzQXJyYXkgPSBuYXRpdmVJc0FycmF5IHx8IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiB0b1N0cmluZy5jYWxsKG9iaikgPT0gJ1tvYmplY3QgQXJyYXldJztcbiAgfTtcblxuICAvLyBJcyBhIGdpdmVuIHZhcmlhYmxlIGFuIG9iamVjdD9cbiAgXy5pc09iamVjdCA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiBvYmogPT09IE9iamVjdChvYmopO1xuICB9O1xuXG4gIC8vIEFkZCBzb21lIGlzVHlwZSBtZXRob2RzOiBpc0FyZ3VtZW50cywgaXNGdW5jdGlvbiwgaXNTdHJpbmcsIGlzTnVtYmVyLCBpc0RhdGUsIGlzUmVnRXhwLlxuICBlYWNoKFsnQXJndW1lbnRzJywgJ0Z1bmN0aW9uJywgJ1N0cmluZycsICdOdW1iZXInLCAnRGF0ZScsICdSZWdFeHAnXSwgZnVuY3Rpb24obmFtZSkge1xuICAgIF9bJ2lzJyArIG5hbWVdID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXR1cm4gdG9TdHJpbmcuY2FsbChvYmopID09ICdbb2JqZWN0ICcgKyBuYW1lICsgJ10nO1xuICAgIH07XG4gIH0pO1xuXG4gIC8vIERlZmluZSBhIGZhbGxiYWNrIHZlcnNpb24gb2YgdGhlIG1ldGhvZCBpbiBicm93c2VycyAoYWhlbSwgSUUpLCB3aGVyZVxuICAvLyB0aGVyZSBpc24ndCBhbnkgaW5zcGVjdGFibGUgXCJBcmd1bWVudHNcIiB0eXBlLlxuICBpZiAoIV8uaXNBcmd1bWVudHMoYXJndW1lbnRzKSkge1xuICAgIF8uaXNBcmd1bWVudHMgPSBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiAhIShvYmogJiYgXy5oYXMob2JqLCAnY2FsbGVlJykpO1xuICAgIH07XG4gIH1cblxuICAvLyBPcHRpbWl6ZSBgaXNGdW5jdGlvbmAgaWYgYXBwcm9wcmlhdGUuXG4gIGlmICh0eXBlb2YgKC8uLykgIT09ICdmdW5jdGlvbicpIHtcbiAgICBfLmlzRnVuY3Rpb24gPSBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiB0eXBlb2Ygb2JqID09PSAnZnVuY3Rpb24nO1xuICAgIH07XG4gIH1cblxuICAvLyBJcyBhIGdpdmVuIG9iamVjdCBhIGZpbml0ZSBudW1iZXI/XG4gIF8uaXNGaW5pdGUgPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gaXNGaW5pdGUob2JqKSAmJiAhaXNOYU4ocGFyc2VGbG9hdChvYmopKTtcbiAgfTtcblxuICAvLyBJcyB0aGUgZ2l2ZW4gdmFsdWUgYE5hTmA/IChOYU4gaXMgdGhlIG9ubHkgbnVtYmVyIHdoaWNoIGRvZXMgbm90IGVxdWFsIGl0c2VsZikuXG4gIF8uaXNOYU4gPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gXy5pc051bWJlcihvYmopICYmIG9iaiAhPSArb2JqO1xuICB9O1xuXG4gIC8vIElzIGEgZ2l2ZW4gdmFsdWUgYSBib29sZWFuP1xuICBfLmlzQm9vbGVhbiA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiBvYmogPT09IHRydWUgfHwgb2JqID09PSBmYWxzZSB8fCB0b1N0cmluZy5jYWxsKG9iaikgPT0gJ1tvYmplY3QgQm9vbGVhbl0nO1xuICB9O1xuXG4gIC8vIElzIGEgZ2l2ZW4gdmFsdWUgZXF1YWwgdG8gbnVsbD9cbiAgXy5pc051bGwgPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gb2JqID09PSBudWxsO1xuICB9O1xuXG4gIC8vIElzIGEgZ2l2ZW4gdmFyaWFibGUgdW5kZWZpbmVkP1xuICBfLmlzVW5kZWZpbmVkID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIG9iaiA9PT0gdm9pZCAwO1xuICB9O1xuXG4gIC8vIFNob3J0Y3V0IGZ1bmN0aW9uIGZvciBjaGVja2luZyBpZiBhbiBvYmplY3QgaGFzIGEgZ2l2ZW4gcHJvcGVydHkgZGlyZWN0bHlcbiAgLy8gb24gaXRzZWxmIChpbiBvdGhlciB3b3Jkcywgbm90IG9uIGEgcHJvdG90eXBlKS5cbiAgXy5oYXMgPSBmdW5jdGlvbihvYmosIGtleSkge1xuICAgIHJldHVybiBoYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwga2V5KTtcbiAgfTtcblxuICAvLyBVdGlsaXR5IEZ1bmN0aW9uc1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIFJ1biBVbmRlcnNjb3JlLmpzIGluICpub0NvbmZsaWN0KiBtb2RlLCByZXR1cm5pbmcgdGhlIGBfYCB2YXJpYWJsZSB0byBpdHNcbiAgLy8gcHJldmlvdXMgb3duZXIuIFJldHVybnMgYSByZWZlcmVuY2UgdG8gdGhlIFVuZGVyc2NvcmUgb2JqZWN0LlxuICBfLm5vQ29uZmxpY3QgPSBmdW5jdGlvbigpIHtcbiAgICByb290Ll8gPSBwcmV2aW91c1VuZGVyc2NvcmU7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLy8gS2VlcCB0aGUgaWRlbnRpdHkgZnVuY3Rpb24gYXJvdW5kIGZvciBkZWZhdWx0IGl0ZXJhdG9ycy5cbiAgXy5pZGVudGl0eSA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9O1xuXG4gIC8vIFJ1biBhIGZ1bmN0aW9uICoqbioqIHRpbWVzLlxuICBfLnRpbWVzID0gZnVuY3Rpb24obiwgaXRlcmF0b3IsIGNvbnRleHQpIHtcbiAgICB2YXIgYWNjdW0gPSBBcnJheShNYXRoLm1heCgwLCBuKSk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBuOyBpKyspIGFjY3VtW2ldID0gaXRlcmF0b3IuY2FsbChjb250ZXh0LCBpKTtcbiAgICByZXR1cm4gYWNjdW07XG4gIH07XG5cbiAgLy8gUmV0dXJuIGEgcmFuZG9tIGludGVnZXIgYmV0d2VlbiBtaW4gYW5kIG1heCAoaW5jbHVzaXZlKS5cbiAgXy5yYW5kb20gPSBmdW5jdGlvbihtaW4sIG1heCkge1xuICAgIGlmIChtYXggPT0gbnVsbCkge1xuICAgICAgbWF4ID0gbWluO1xuICAgICAgbWluID0gMDtcbiAgICB9XG4gICAgcmV0dXJuIG1pbiArIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4gKyAxKSk7XG4gIH07XG5cbiAgLy8gTGlzdCBvZiBIVE1MIGVudGl0aWVzIGZvciBlc2NhcGluZy5cbiAgdmFyIGVudGl0eU1hcCA9IHtcbiAgICBlc2NhcGU6IHtcbiAgICAgICcmJzogJyZhbXA7JyxcbiAgICAgICc8JzogJyZsdDsnLFxuICAgICAgJz4nOiAnJmd0OycsXG4gICAgICAnXCInOiAnJnF1b3Q7JyxcbiAgICAgIFwiJ1wiOiAnJiN4Mjc7J1xuICAgIH1cbiAgfTtcbiAgZW50aXR5TWFwLnVuZXNjYXBlID0gXy5pbnZlcnQoZW50aXR5TWFwLmVzY2FwZSk7XG5cbiAgLy8gUmVnZXhlcyBjb250YWluaW5nIHRoZSBrZXlzIGFuZCB2YWx1ZXMgbGlzdGVkIGltbWVkaWF0ZWx5IGFib3ZlLlxuICB2YXIgZW50aXR5UmVnZXhlcyA9IHtcbiAgICBlc2NhcGU6ICAgbmV3IFJlZ0V4cCgnWycgKyBfLmtleXMoZW50aXR5TWFwLmVzY2FwZSkuam9pbignJykgKyAnXScsICdnJyksXG4gICAgdW5lc2NhcGU6IG5ldyBSZWdFeHAoJygnICsgXy5rZXlzKGVudGl0eU1hcC51bmVzY2FwZSkuam9pbignfCcpICsgJyknLCAnZycpXG4gIH07XG5cbiAgLy8gRnVuY3Rpb25zIGZvciBlc2NhcGluZyBhbmQgdW5lc2NhcGluZyBzdHJpbmdzIHRvL2Zyb20gSFRNTCBpbnRlcnBvbGF0aW9uLlxuICBfLmVhY2goWydlc2NhcGUnLCAndW5lc2NhcGUnXSwgZnVuY3Rpb24obWV0aG9kKSB7XG4gICAgX1ttZXRob2RdID0gZnVuY3Rpb24oc3RyaW5nKSB7XG4gICAgICBpZiAoc3RyaW5nID09IG51bGwpIHJldHVybiAnJztcbiAgICAgIHJldHVybiAoJycgKyBzdHJpbmcpLnJlcGxhY2UoZW50aXR5UmVnZXhlc1ttZXRob2RdLCBmdW5jdGlvbihtYXRjaCkge1xuICAgICAgICByZXR1cm4gZW50aXR5TWFwW21ldGhvZF1bbWF0Y2hdO1xuICAgICAgfSk7XG4gICAgfTtcbiAgfSk7XG5cbiAgLy8gSWYgdGhlIHZhbHVlIG9mIHRoZSBuYW1lZCBgcHJvcGVydHlgIGlzIGEgZnVuY3Rpb24gdGhlbiBpbnZva2UgaXQgd2l0aCB0aGVcbiAgLy8gYG9iamVjdGAgYXMgY29udGV4dDsgb3RoZXJ3aXNlLCByZXR1cm4gaXQuXG4gIF8ucmVzdWx0ID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkge1xuICAgIGlmIChvYmplY3QgPT0gbnVsbCkgcmV0dXJuIHZvaWQgMDtcbiAgICB2YXIgdmFsdWUgPSBvYmplY3RbcHJvcGVydHldO1xuICAgIHJldHVybiBfLmlzRnVuY3Rpb24odmFsdWUpID8gdmFsdWUuY2FsbChvYmplY3QpIDogdmFsdWU7XG4gIH07XG5cbiAgLy8gQWRkIHlvdXIgb3duIGN1c3RvbSBmdW5jdGlvbnMgdG8gdGhlIFVuZGVyc2NvcmUgb2JqZWN0LlxuICBfLm1peGluID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgZWFjaChfLmZ1bmN0aW9ucyhvYmopLCBmdW5jdGlvbihuYW1lKSB7XG4gICAgICB2YXIgZnVuYyA9IF9bbmFtZV0gPSBvYmpbbmFtZV07XG4gICAgICBfLnByb3RvdHlwZVtuYW1lXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgYXJncyA9IFt0aGlzLl93cmFwcGVkXTtcbiAgICAgICAgcHVzaC5hcHBseShhcmdzLCBhcmd1bWVudHMpO1xuICAgICAgICByZXR1cm4gcmVzdWx0LmNhbGwodGhpcywgZnVuYy5hcHBseShfLCBhcmdzKSk7XG4gICAgICB9O1xuICAgIH0pO1xuICB9O1xuXG4gIC8vIEdlbmVyYXRlIGEgdW5pcXVlIGludGVnZXIgaWQgKHVuaXF1ZSB3aXRoaW4gdGhlIGVudGlyZSBjbGllbnQgc2Vzc2lvbikuXG4gIC8vIFVzZWZ1bCBmb3IgdGVtcG9yYXJ5IERPTSBpZHMuXG4gIHZhciBpZENvdW50ZXIgPSAwO1xuICBfLnVuaXF1ZUlkID0gZnVuY3Rpb24ocHJlZml4KSB7XG4gICAgdmFyIGlkID0gKytpZENvdW50ZXIgKyAnJztcbiAgICByZXR1cm4gcHJlZml4ID8gcHJlZml4ICsgaWQgOiBpZDtcbiAgfTtcblxuICAvLyBCeSBkZWZhdWx0LCBVbmRlcnNjb3JlIHVzZXMgRVJCLXN0eWxlIHRlbXBsYXRlIGRlbGltaXRlcnMsIGNoYW5nZSB0aGVcbiAgLy8gZm9sbG93aW5nIHRlbXBsYXRlIHNldHRpbmdzIHRvIHVzZSBhbHRlcm5hdGl2ZSBkZWxpbWl0ZXJzLlxuICBfLnRlbXBsYXRlU2V0dGluZ3MgPSB7XG4gICAgZXZhbHVhdGUgICAgOiAvPCUoW1xcc1xcU10rPyklPi9nLFxuICAgIGludGVycG9sYXRlIDogLzwlPShbXFxzXFxTXSs/KSU+L2csXG4gICAgZXNjYXBlICAgICAgOiAvPCUtKFtcXHNcXFNdKz8pJT4vZ1xuICB9O1xuXG4gIC8vIFdoZW4gY3VzdG9taXppbmcgYHRlbXBsYXRlU2V0dGluZ3NgLCBpZiB5b3UgZG9uJ3Qgd2FudCB0byBkZWZpbmUgYW5cbiAgLy8gaW50ZXJwb2xhdGlvbiwgZXZhbHVhdGlvbiBvciBlc2NhcGluZyByZWdleCwgd2UgbmVlZCBvbmUgdGhhdCBpc1xuICAvLyBndWFyYW50ZWVkIG5vdCB0byBtYXRjaC5cbiAgdmFyIG5vTWF0Y2ggPSAvKC4pXi87XG5cbiAgLy8gQ2VydGFpbiBjaGFyYWN0ZXJzIG5lZWQgdG8gYmUgZXNjYXBlZCBzbyB0aGF0IHRoZXkgY2FuIGJlIHB1dCBpbnRvIGFcbiAgLy8gc3RyaW5nIGxpdGVyYWwuXG4gIHZhciBlc2NhcGVzID0ge1xuICAgIFwiJ1wiOiAgICAgIFwiJ1wiLFxuICAgICdcXFxcJzogICAgICdcXFxcJyxcbiAgICAnXFxyJzogICAgICdyJyxcbiAgICAnXFxuJzogICAgICduJyxcbiAgICAnXFx0JzogICAgICd0JyxcbiAgICAnXFx1MjAyOCc6ICd1MjAyOCcsXG4gICAgJ1xcdTIwMjknOiAndTIwMjknXG4gIH07XG5cbiAgdmFyIGVzY2FwZXIgPSAvXFxcXHwnfFxccnxcXG58XFx0fFxcdTIwMjh8XFx1MjAyOS9nO1xuXG4gIC8vIEphdmFTY3JpcHQgbWljcm8tdGVtcGxhdGluZywgc2ltaWxhciB0byBKb2huIFJlc2lnJ3MgaW1wbGVtZW50YXRpb24uXG4gIC8vIFVuZGVyc2NvcmUgdGVtcGxhdGluZyBoYW5kbGVzIGFyYml0cmFyeSBkZWxpbWl0ZXJzLCBwcmVzZXJ2ZXMgd2hpdGVzcGFjZSxcbiAgLy8gYW5kIGNvcnJlY3RseSBlc2NhcGVzIHF1b3RlcyB3aXRoaW4gaW50ZXJwb2xhdGVkIGNvZGUuXG4gIF8udGVtcGxhdGUgPSBmdW5jdGlvbih0ZXh0LCBkYXRhLCBzZXR0aW5ncykge1xuICAgIHZhciByZW5kZXI7XG4gICAgc2V0dGluZ3MgPSBfLmRlZmF1bHRzKHt9LCBzZXR0aW5ncywgXy50ZW1wbGF0ZVNldHRpbmdzKTtcblxuICAgIC8vIENvbWJpbmUgZGVsaW1pdGVycyBpbnRvIG9uZSByZWd1bGFyIGV4cHJlc3Npb24gdmlhIGFsdGVybmF0aW9uLlxuICAgIHZhciBtYXRjaGVyID0gbmV3IFJlZ0V4cChbXG4gICAgICAoc2V0dGluZ3MuZXNjYXBlIHx8IG5vTWF0Y2gpLnNvdXJjZSxcbiAgICAgIChzZXR0aW5ncy5pbnRlcnBvbGF0ZSB8fCBub01hdGNoKS5zb3VyY2UsXG4gICAgICAoc2V0dGluZ3MuZXZhbHVhdGUgfHwgbm9NYXRjaCkuc291cmNlXG4gICAgXS5qb2luKCd8JykgKyAnfCQnLCAnZycpO1xuXG4gICAgLy8gQ29tcGlsZSB0aGUgdGVtcGxhdGUgc291cmNlLCBlc2NhcGluZyBzdHJpbmcgbGl0ZXJhbHMgYXBwcm9wcmlhdGVseS5cbiAgICB2YXIgaW5kZXggPSAwO1xuICAgIHZhciBzb3VyY2UgPSBcIl9fcCs9J1wiO1xuICAgIHRleHQucmVwbGFjZShtYXRjaGVyLCBmdW5jdGlvbihtYXRjaCwgZXNjYXBlLCBpbnRlcnBvbGF0ZSwgZXZhbHVhdGUsIG9mZnNldCkge1xuICAgICAgc291cmNlICs9IHRleHQuc2xpY2UoaW5kZXgsIG9mZnNldClcbiAgICAgICAgLnJlcGxhY2UoZXNjYXBlciwgZnVuY3Rpb24obWF0Y2gpIHsgcmV0dXJuICdcXFxcJyArIGVzY2FwZXNbbWF0Y2hdOyB9KTtcblxuICAgICAgaWYgKGVzY2FwZSkge1xuICAgICAgICBzb3VyY2UgKz0gXCInK1xcbigoX190PShcIiArIGVzY2FwZSArIFwiKSk9PW51bGw/Jyc6Xy5lc2NhcGUoX190KSkrXFxuJ1wiO1xuICAgICAgfVxuICAgICAgaWYgKGludGVycG9sYXRlKSB7XG4gICAgICAgIHNvdXJjZSArPSBcIicrXFxuKChfX3Q9KFwiICsgaW50ZXJwb2xhdGUgKyBcIikpPT1udWxsPycnOl9fdCkrXFxuJ1wiO1xuICAgICAgfVxuICAgICAgaWYgKGV2YWx1YXRlKSB7XG4gICAgICAgIHNvdXJjZSArPSBcIic7XFxuXCIgKyBldmFsdWF0ZSArIFwiXFxuX19wKz0nXCI7XG4gICAgICB9XG4gICAgICBpbmRleCA9IG9mZnNldCArIG1hdGNoLmxlbmd0aDtcbiAgICAgIHJldHVybiBtYXRjaDtcbiAgICB9KTtcbiAgICBzb3VyY2UgKz0gXCInO1xcblwiO1xuXG4gICAgLy8gSWYgYSB2YXJpYWJsZSBpcyBub3Qgc3BlY2lmaWVkLCBwbGFjZSBkYXRhIHZhbHVlcyBpbiBsb2NhbCBzY29wZS5cbiAgICBpZiAoIXNldHRpbmdzLnZhcmlhYmxlKSBzb3VyY2UgPSAnd2l0aChvYmp8fHt9KXtcXG4nICsgc291cmNlICsgJ31cXG4nO1xuXG4gICAgc291cmNlID0gXCJ2YXIgX190LF9fcD0nJyxfX2o9QXJyYXkucHJvdG90eXBlLmpvaW4sXCIgK1xuICAgICAgXCJwcmludD1mdW5jdGlvbigpe19fcCs9X19qLmNhbGwoYXJndW1lbnRzLCcnKTt9O1xcblwiICtcbiAgICAgIHNvdXJjZSArIFwicmV0dXJuIF9fcDtcXG5cIjtcblxuICAgIHRyeSB7XG4gICAgICByZW5kZXIgPSBuZXcgRnVuY3Rpb24oc2V0dGluZ3MudmFyaWFibGUgfHwgJ29iaicsICdfJywgc291cmNlKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBlLnNvdXJjZSA9IHNvdXJjZTtcbiAgICAgIHRocm93IGU7XG4gICAgfVxuXG4gICAgaWYgKGRhdGEpIHJldHVybiByZW5kZXIoZGF0YSwgXyk7XG4gICAgdmFyIHRlbXBsYXRlID0gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgcmV0dXJuIHJlbmRlci5jYWxsKHRoaXMsIGRhdGEsIF8pO1xuICAgIH07XG5cbiAgICAvLyBQcm92aWRlIHRoZSBjb21waWxlZCBmdW5jdGlvbiBzb3VyY2UgYXMgYSBjb252ZW5pZW5jZSBmb3IgcHJlY29tcGlsYXRpb24uXG4gICAgdGVtcGxhdGUuc291cmNlID0gJ2Z1bmN0aW9uKCcgKyAoc2V0dGluZ3MudmFyaWFibGUgfHwgJ29iaicpICsgJyl7XFxuJyArIHNvdXJjZSArICd9JztcblxuICAgIHJldHVybiB0ZW1wbGF0ZTtcbiAgfTtcblxuICAvLyBBZGQgYSBcImNoYWluXCIgZnVuY3Rpb24sIHdoaWNoIHdpbGwgZGVsZWdhdGUgdG8gdGhlIHdyYXBwZXIuXG4gIF8uY2hhaW4gPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gXyhvYmopLmNoYWluKCk7XG4gIH07XG5cbiAgLy8gT09QXG4gIC8vIC0tLS0tLS0tLS0tLS0tLVxuICAvLyBJZiBVbmRlcnNjb3JlIGlzIGNhbGxlZCBhcyBhIGZ1bmN0aW9uLCBpdCByZXR1cm5zIGEgd3JhcHBlZCBvYmplY3QgdGhhdFxuICAvLyBjYW4gYmUgdXNlZCBPTy1zdHlsZS4gVGhpcyB3cmFwcGVyIGhvbGRzIGFsdGVyZWQgdmVyc2lvbnMgb2YgYWxsIHRoZVxuICAvLyB1bmRlcnNjb3JlIGZ1bmN0aW9ucy4gV3JhcHBlZCBvYmplY3RzIG1heSBiZSBjaGFpbmVkLlxuXG4gIC8vIEhlbHBlciBmdW5jdGlvbiB0byBjb250aW51ZSBjaGFpbmluZyBpbnRlcm1lZGlhdGUgcmVzdWx0cy5cbiAgdmFyIHJlc3VsdCA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiB0aGlzLl9jaGFpbiA/IF8ob2JqKS5jaGFpbigpIDogb2JqO1xuICB9O1xuXG4gIC8vIEFkZCBhbGwgb2YgdGhlIFVuZGVyc2NvcmUgZnVuY3Rpb25zIHRvIHRoZSB3cmFwcGVyIG9iamVjdC5cbiAgXy5taXhpbihfKTtcblxuICAvLyBBZGQgYWxsIG11dGF0b3IgQXJyYXkgZnVuY3Rpb25zIHRvIHRoZSB3cmFwcGVyLlxuICBlYWNoKFsncG9wJywgJ3B1c2gnLCAncmV2ZXJzZScsICdzaGlmdCcsICdzb3J0JywgJ3NwbGljZScsICd1bnNoaWZ0J10sIGZ1bmN0aW9uKG5hbWUpIHtcbiAgICB2YXIgbWV0aG9kID0gQXJyYXlQcm90b1tuYW1lXTtcbiAgICBfLnByb3RvdHlwZVtuYW1lXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIG9iaiA9IHRoaXMuX3dyYXBwZWQ7XG4gICAgICBtZXRob2QuYXBwbHkob2JqLCBhcmd1bWVudHMpO1xuICAgICAgaWYgKChuYW1lID09ICdzaGlmdCcgfHwgbmFtZSA9PSAnc3BsaWNlJykgJiYgb2JqLmxlbmd0aCA9PT0gMCkgZGVsZXRlIG9ialswXTtcbiAgICAgIHJldHVybiByZXN1bHQuY2FsbCh0aGlzLCBvYmopO1xuICAgIH07XG4gIH0pO1xuXG4gIC8vIEFkZCBhbGwgYWNjZXNzb3IgQXJyYXkgZnVuY3Rpb25zIHRvIHRoZSB3cmFwcGVyLlxuICBlYWNoKFsnY29uY2F0JywgJ2pvaW4nLCAnc2xpY2UnXSwgZnVuY3Rpb24obmFtZSkge1xuICAgIHZhciBtZXRob2QgPSBBcnJheVByb3RvW25hbWVdO1xuICAgIF8ucHJvdG90eXBlW25hbWVdID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gcmVzdWx0LmNhbGwodGhpcywgbWV0aG9kLmFwcGx5KHRoaXMuX3dyYXBwZWQsIGFyZ3VtZW50cykpO1xuICAgIH07XG4gIH0pO1xuXG4gIF8uZXh0ZW5kKF8ucHJvdG90eXBlLCB7XG5cbiAgICAvLyBTdGFydCBjaGFpbmluZyBhIHdyYXBwZWQgVW5kZXJzY29yZSBvYmplY3QuXG4gICAgY2hhaW46IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5fY2hhaW4gPSB0cnVlO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIC8vIEV4dHJhY3RzIHRoZSByZXN1bHQgZnJvbSBhIHdyYXBwZWQgYW5kIGNoYWluZWQgb2JqZWN0LlxuICAgIHZhbHVlOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLl93cmFwcGVkO1xuICAgIH1cblxuICB9KTtcblxufSkuY2FsbCh0aGlzKTtcbiIsInZhciBwcm9jZXNzPXJlcXVpcmUoXCJfX2Jyb3dzZXJpZnlfcHJvY2Vzc1wiKTtpZiAoIXByb2Nlc3MuRXZlbnRFbWl0dGVyKSBwcm9jZXNzLkV2ZW50RW1pdHRlciA9IGZ1bmN0aW9uICgpIHt9O1xuXG52YXIgRXZlbnRFbWl0dGVyID0gZXhwb3J0cy5FdmVudEVtaXR0ZXIgPSBwcm9jZXNzLkV2ZW50RW1pdHRlcjtcbnZhciBpc0FycmF5ID0gdHlwZW9mIEFycmF5LmlzQXJyYXkgPT09ICdmdW5jdGlvbidcbiAgICA/IEFycmF5LmlzQXJyYXlcbiAgICA6IGZ1bmN0aW9uICh4cykge1xuICAgICAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHhzKSA9PT0gJ1tvYmplY3QgQXJyYXldJ1xuICAgIH1cbjtcbmZ1bmN0aW9uIGluZGV4T2YgKHhzLCB4KSB7XG4gICAgaWYgKHhzLmluZGV4T2YpIHJldHVybiB4cy5pbmRleE9mKHgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgeHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKHggPT09IHhzW2ldKSByZXR1cm4gaTtcbiAgICB9XG4gICAgcmV0dXJuIC0xO1xufVxuXG4vLyBCeSBkZWZhdWx0IEV2ZW50RW1pdHRlcnMgd2lsbCBwcmludCBhIHdhcm5pbmcgaWYgbW9yZSB0aGFuXG4vLyAxMCBsaXN0ZW5lcnMgYXJlIGFkZGVkIHRvIGl0LiBUaGlzIGlzIGEgdXNlZnVsIGRlZmF1bHQgd2hpY2hcbi8vIGhlbHBzIGZpbmRpbmcgbWVtb3J5IGxlYWtzLlxuLy9cbi8vIE9idmlvdXNseSBub3QgYWxsIEVtaXR0ZXJzIHNob3VsZCBiZSBsaW1pdGVkIHRvIDEwLiBUaGlzIGZ1bmN0aW9uIGFsbG93c1xuLy8gdGhhdCB0byBiZSBpbmNyZWFzZWQuIFNldCB0byB6ZXJvIGZvciB1bmxpbWl0ZWQuXG52YXIgZGVmYXVsdE1heExpc3RlbmVycyA9IDEwO1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5zZXRNYXhMaXN0ZW5lcnMgPSBmdW5jdGlvbihuKSB7XG4gIGlmICghdGhpcy5fZXZlbnRzKSB0aGlzLl9ldmVudHMgPSB7fTtcbiAgdGhpcy5fZXZlbnRzLm1heExpc3RlbmVycyA9IG47XG59O1xuXG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgLy8gSWYgdGhlcmUgaXMgbm8gJ2Vycm9yJyBldmVudCBsaXN0ZW5lciB0aGVuIHRocm93LlxuICBpZiAodHlwZSA9PT0gJ2Vycm9yJykge1xuICAgIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHMuZXJyb3IgfHxcbiAgICAgICAgKGlzQXJyYXkodGhpcy5fZXZlbnRzLmVycm9yKSAmJiAhdGhpcy5fZXZlbnRzLmVycm9yLmxlbmd0aCkpXG4gICAge1xuICAgICAgaWYgKGFyZ3VtZW50c1sxXSBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgIHRocm93IGFyZ3VtZW50c1sxXTsgLy8gVW5oYW5kbGVkICdlcnJvcicgZXZlbnRcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVuY2F1Z2h0LCB1bnNwZWNpZmllZCAnZXJyb3InIGV2ZW50LlwiKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICBpZiAoIXRoaXMuX2V2ZW50cykgcmV0dXJuIGZhbHNlO1xuICB2YXIgaGFuZGxlciA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgaWYgKCFoYW5kbGVyKSByZXR1cm4gZmFsc2U7XG5cbiAgaWYgKHR5cGVvZiBoYW5kbGVyID09ICdmdW5jdGlvbicpIHtcbiAgICBzd2l0Y2ggKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgIC8vIGZhc3QgY2FzZXNcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMjpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAzOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdLCBhcmd1bWVudHNbMl0pO1xuICAgICAgICBicmVhaztcbiAgICAgIC8vIHNsb3dlclxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgICAgICBoYW5kbGVyLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcblxuICB9IGVsc2UgaWYgKGlzQXJyYXkoaGFuZGxlcikpIHtcbiAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG5cbiAgICB2YXIgbGlzdGVuZXJzID0gaGFuZGxlci5zbGljZSgpO1xuICAgIGZvciAodmFyIGkgPSAwLCBsID0gbGlzdGVuZXJzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgbGlzdGVuZXJzW2ldLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcblxuICB9IGVsc2Uge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufTtcblxuLy8gRXZlbnRFbWl0dGVyIGlzIGRlZmluZWQgaW4gc3JjL25vZGVfZXZlbnRzLmNjXG4vLyBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXQoKSBpcyBhbHNvIGRlZmluZWQgdGhlcmUuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgaWYgKCdmdW5jdGlvbicgIT09IHR5cGVvZiBsaXN0ZW5lcikge1xuICAgIHRocm93IG5ldyBFcnJvcignYWRkTGlzdGVuZXIgb25seSB0YWtlcyBpbnN0YW5jZXMgb2YgRnVuY3Rpb24nKTtcbiAgfVxuXG4gIGlmICghdGhpcy5fZXZlbnRzKSB0aGlzLl9ldmVudHMgPSB7fTtcblxuICAvLyBUbyBhdm9pZCByZWN1cnNpb24gaW4gdGhlIGNhc2UgdGhhdCB0eXBlID09IFwibmV3TGlzdGVuZXJzXCIhIEJlZm9yZVxuICAvLyBhZGRpbmcgaXQgdG8gdGhlIGxpc3RlbmVycywgZmlyc3QgZW1pdCBcIm5ld0xpc3RlbmVyc1wiLlxuICB0aGlzLmVtaXQoJ25ld0xpc3RlbmVyJywgdHlwZSwgbGlzdGVuZXIpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzW3R5cGVdKSB7XG4gICAgLy8gT3B0aW1pemUgdGhlIGNhc2Ugb2Ygb25lIGxpc3RlbmVyLiBEb24ndCBuZWVkIHRoZSBleHRyYSBhcnJheSBvYmplY3QuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdID0gbGlzdGVuZXI7XG4gIH0gZWxzZSBpZiAoaXNBcnJheSh0aGlzLl9ldmVudHNbdHlwZV0pKSB7XG5cbiAgICAvLyBDaGVjayBmb3IgbGlzdGVuZXIgbGVha1xuICAgIGlmICghdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCkge1xuICAgICAgdmFyIG07XG4gICAgICBpZiAodGhpcy5fZXZlbnRzLm1heExpc3RlbmVycyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIG0gPSB0aGlzLl9ldmVudHMubWF4TGlzdGVuZXJzO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbSA9IGRlZmF1bHRNYXhMaXN0ZW5lcnM7XG4gICAgICB9XG5cbiAgICAgIGlmIChtICYmIG0gPiAwICYmIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGggPiBtKSB7XG4gICAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS53YXJuZWQgPSB0cnVlO1xuICAgICAgICBjb25zb2xlLmVycm9yKCcobm9kZSkgd2FybmluZzogcG9zc2libGUgRXZlbnRFbWl0dGVyIG1lbW9yeSAnICtcbiAgICAgICAgICAgICAgICAgICAgICAnbGVhayBkZXRlY3RlZC4gJWQgbGlzdGVuZXJzIGFkZGVkLiAnICtcbiAgICAgICAgICAgICAgICAgICAgICAnVXNlIGVtaXR0ZXIuc2V0TWF4TGlzdGVuZXJzKCkgdG8gaW5jcmVhc2UgbGltaXQuJyxcbiAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoKTtcbiAgICAgICAgY29uc29sZS50cmFjZSgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIElmIHdlJ3ZlIGFscmVhZHkgZ290IGFuIGFycmF5LCBqdXN0IGFwcGVuZC5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0ucHVzaChsaXN0ZW5lcik7XG4gIH0gZWxzZSB7XG4gICAgLy8gQWRkaW5nIHRoZSBzZWNvbmQgZWxlbWVudCwgbmVlZCB0byBjaGFuZ2UgdG8gYXJyYXkuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdID0gW3RoaXMuX2V2ZW50c1t0eXBlXSwgbGlzdGVuZXJdO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICBzZWxmLm9uKHR5cGUsIGZ1bmN0aW9uIGcoKSB7XG4gICAgc2VsZi5yZW1vdmVMaXN0ZW5lcih0eXBlLCBnKTtcbiAgICBsaXN0ZW5lci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9KTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICBpZiAoJ2Z1bmN0aW9uJyAhPT0gdHlwZW9mIGxpc3RlbmVyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdyZW1vdmVMaXN0ZW5lciBvbmx5IHRha2VzIGluc3RhbmNlcyBvZiBGdW5jdGlvbicpO1xuICB9XG5cbiAgLy8gZG9lcyBub3QgdXNlIGxpc3RlbmVycygpLCBzbyBubyBzaWRlIGVmZmVjdCBvZiBjcmVhdGluZyBfZXZlbnRzW3R5cGVdXG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbdHlwZV0pIHJldHVybiB0aGlzO1xuXG4gIHZhciBsaXN0ID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIGlmIChpc0FycmF5KGxpc3QpKSB7XG4gICAgdmFyIGkgPSBpbmRleE9mKGxpc3QsIGxpc3RlbmVyKTtcbiAgICBpZiAoaSA8IDApIHJldHVybiB0aGlzO1xuICAgIGxpc3Quc3BsaWNlKGksIDEpO1xuICAgIGlmIChsaXN0Lmxlbmd0aCA9PSAwKVxuICAgICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgfSBlbHNlIGlmICh0aGlzLl9ldmVudHNbdHlwZV0gPT09IGxpc3RlbmVyKSB7XG4gICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgdGhpcy5fZXZlbnRzID0ge307XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyBkb2VzIG5vdCB1c2UgbGlzdGVuZXJzKCksIHNvIG5vIHNpZGUgZWZmZWN0IG9mIGNyZWF0aW5nIF9ldmVudHNbdHlwZV1cbiAgaWYgKHR5cGUgJiYgdGhpcy5fZXZlbnRzICYmIHRoaXMuX2V2ZW50c1t0eXBlXSkgdGhpcy5fZXZlbnRzW3R5cGVdID0gbnVsbDtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVycyA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgaWYgKCF0aGlzLl9ldmVudHMpIHRoaXMuX2V2ZW50cyA9IHt9O1xuICBpZiAoIXRoaXMuX2V2ZW50c1t0eXBlXSkgdGhpcy5fZXZlbnRzW3R5cGVdID0gW107XG4gIGlmICghaXNBcnJheSh0aGlzLl9ldmVudHNbdHlwZV0pKSB7XG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdID0gW3RoaXMuX2V2ZW50c1t0eXBlXV07XG4gIH1cbiAgcmV0dXJuIHRoaXMuX2V2ZW50c1t0eXBlXTtcbn07XG5cbkV2ZW50RW1pdHRlci5saXN0ZW5lckNvdW50ID0gZnVuY3Rpb24oZW1pdHRlciwgdHlwZSkge1xuICB2YXIgcmV0O1xuICBpZiAoIWVtaXR0ZXIuX2V2ZW50cyB8fCAhZW1pdHRlci5fZXZlbnRzW3R5cGVdKVxuICAgIHJldCA9IDA7XG4gIGVsc2UgaWYgKHR5cGVvZiBlbWl0dGVyLl9ldmVudHNbdHlwZV0gPT09ICdmdW5jdGlvbicpXG4gICAgcmV0ID0gMTtcbiAgZWxzZVxuICAgIHJldCA9IGVtaXR0ZXIuX2V2ZW50c1t0eXBlXS5sZW5ndGg7XG4gIHJldHVybiByZXQ7XG59O1xuIiwidmFyIGV2ZW50cyA9IHJlcXVpcmUoJ2V2ZW50cycpO1xuXG5leHBvcnRzLmlzQXJyYXkgPSBpc0FycmF5O1xuZXhwb3J0cy5pc0RhdGUgPSBmdW5jdGlvbihvYmope3JldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgRGF0ZV0nfTtcbmV4cG9ydHMuaXNSZWdFeHAgPSBmdW5jdGlvbihvYmope3JldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgUmVnRXhwXSd9O1xuXG5cbmV4cG9ydHMucHJpbnQgPSBmdW5jdGlvbiAoKSB7fTtcbmV4cG9ydHMucHV0cyA9IGZ1bmN0aW9uICgpIHt9O1xuZXhwb3J0cy5kZWJ1ZyA9IGZ1bmN0aW9uKCkge307XG5cbmV4cG9ydHMuaW5zcGVjdCA9IGZ1bmN0aW9uKG9iaiwgc2hvd0hpZGRlbiwgZGVwdGgsIGNvbG9ycykge1xuICB2YXIgc2VlbiA9IFtdO1xuXG4gIHZhciBzdHlsaXplID0gZnVuY3Rpb24oc3RyLCBzdHlsZVR5cGUpIHtcbiAgICAvLyBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0FOU0lfZXNjYXBlX2NvZGUjZ3JhcGhpY3NcbiAgICB2YXIgc3R5bGVzID1cbiAgICAgICAgeyAnYm9sZCcgOiBbMSwgMjJdLFxuICAgICAgICAgICdpdGFsaWMnIDogWzMsIDIzXSxcbiAgICAgICAgICAndW5kZXJsaW5lJyA6IFs0LCAyNF0sXG4gICAgICAgICAgJ2ludmVyc2UnIDogWzcsIDI3XSxcbiAgICAgICAgICAnd2hpdGUnIDogWzM3LCAzOV0sXG4gICAgICAgICAgJ2dyZXknIDogWzkwLCAzOV0sXG4gICAgICAgICAgJ2JsYWNrJyA6IFszMCwgMzldLFxuICAgICAgICAgICdibHVlJyA6IFszNCwgMzldLFxuICAgICAgICAgICdjeWFuJyA6IFszNiwgMzldLFxuICAgICAgICAgICdncmVlbicgOiBbMzIsIDM5XSxcbiAgICAgICAgICAnbWFnZW50YScgOiBbMzUsIDM5XSxcbiAgICAgICAgICAncmVkJyA6IFszMSwgMzldLFxuICAgICAgICAgICd5ZWxsb3cnIDogWzMzLCAzOV0gfTtcblxuICAgIHZhciBzdHlsZSA9XG4gICAgICAgIHsgJ3NwZWNpYWwnOiAnY3lhbicsXG4gICAgICAgICAgJ251bWJlcic6ICdibHVlJyxcbiAgICAgICAgICAnYm9vbGVhbic6ICd5ZWxsb3cnLFxuICAgICAgICAgICd1bmRlZmluZWQnOiAnZ3JleScsXG4gICAgICAgICAgJ251bGwnOiAnYm9sZCcsXG4gICAgICAgICAgJ3N0cmluZyc6ICdncmVlbicsXG4gICAgICAgICAgJ2RhdGUnOiAnbWFnZW50YScsXG4gICAgICAgICAgLy8gXCJuYW1lXCI6IGludGVudGlvbmFsbHkgbm90IHN0eWxpbmdcbiAgICAgICAgICAncmVnZXhwJzogJ3JlZCcgfVtzdHlsZVR5cGVdO1xuXG4gICAgaWYgKHN0eWxlKSB7XG4gICAgICByZXR1cm4gJ1xcdTAwMWJbJyArIHN0eWxlc1tzdHlsZV1bMF0gKyAnbScgKyBzdHIgK1xuICAgICAgICAgICAgICdcXHUwMDFiWycgKyBzdHlsZXNbc3R5bGVdWzFdICsgJ20nO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gc3RyO1xuICAgIH1cbiAgfTtcbiAgaWYgKCEgY29sb3JzKSB7XG4gICAgc3R5bGl6ZSA9IGZ1bmN0aW9uKHN0ciwgc3R5bGVUeXBlKSB7IHJldHVybiBzdHI7IH07XG4gIH1cblxuICBmdW5jdGlvbiBmb3JtYXQodmFsdWUsIHJlY3Vyc2VUaW1lcykge1xuICAgIC8vIFByb3ZpZGUgYSBob29rIGZvciB1c2VyLXNwZWNpZmllZCBpbnNwZWN0IGZ1bmN0aW9ucy5cbiAgICAvLyBDaGVjayB0aGF0IHZhbHVlIGlzIGFuIG9iamVjdCB3aXRoIGFuIGluc3BlY3QgZnVuY3Rpb24gb24gaXRcbiAgICBpZiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlLmluc3BlY3QgPT09ICdmdW5jdGlvbicgJiZcbiAgICAgICAgLy8gRmlsdGVyIG91dCB0aGUgdXRpbCBtb2R1bGUsIGl0J3MgaW5zcGVjdCBmdW5jdGlvbiBpcyBzcGVjaWFsXG4gICAgICAgIHZhbHVlICE9PSBleHBvcnRzICYmXG4gICAgICAgIC8vIEFsc28gZmlsdGVyIG91dCBhbnkgcHJvdG90eXBlIG9iamVjdHMgdXNpbmcgdGhlIGNpcmN1bGFyIGNoZWNrLlxuICAgICAgICAhKHZhbHVlLmNvbnN0cnVjdG9yICYmIHZhbHVlLmNvbnN0cnVjdG9yLnByb3RvdHlwZSA9PT0gdmFsdWUpKSB7XG4gICAgICByZXR1cm4gdmFsdWUuaW5zcGVjdChyZWN1cnNlVGltZXMpO1xuICAgIH1cblxuICAgIC8vIFByaW1pdGl2ZSB0eXBlcyBjYW5ub3QgaGF2ZSBwcm9wZXJ0aWVzXG4gICAgc3dpdGNoICh0eXBlb2YgdmFsdWUpIHtcbiAgICAgIGNhc2UgJ3VuZGVmaW5lZCc6XG4gICAgICAgIHJldHVybiBzdHlsaXplKCd1bmRlZmluZWQnLCAndW5kZWZpbmVkJyk7XG5cbiAgICAgIGNhc2UgJ3N0cmluZyc6XG4gICAgICAgIHZhciBzaW1wbGUgPSAnXFwnJyArIEpTT04uc3RyaW5naWZ5KHZhbHVlKS5yZXBsYWNlKC9eXCJ8XCIkL2csICcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8nL2csIFwiXFxcXCdcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxcXFwiL2csICdcIicpICsgJ1xcJyc7XG4gICAgICAgIHJldHVybiBzdHlsaXplKHNpbXBsZSwgJ3N0cmluZycpO1xuXG4gICAgICBjYXNlICdudW1iZXInOlxuICAgICAgICByZXR1cm4gc3R5bGl6ZSgnJyArIHZhbHVlLCAnbnVtYmVyJyk7XG5cbiAgICAgIGNhc2UgJ2Jvb2xlYW4nOlxuICAgICAgICByZXR1cm4gc3R5bGl6ZSgnJyArIHZhbHVlLCAnYm9vbGVhbicpO1xuICAgIH1cbiAgICAvLyBGb3Igc29tZSByZWFzb24gdHlwZW9mIG51bGwgaXMgXCJvYmplY3RcIiwgc28gc3BlY2lhbCBjYXNlIGhlcmUuXG4gICAgaWYgKHZhbHVlID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gc3R5bGl6ZSgnbnVsbCcsICdudWxsJyk7XG4gICAgfVxuXG4gICAgLy8gTG9vayB1cCB0aGUga2V5cyBvZiB0aGUgb2JqZWN0LlxuICAgIHZhciB2aXNpYmxlX2tleXMgPSBPYmplY3Rfa2V5cyh2YWx1ZSk7XG4gICAgdmFyIGtleXMgPSBzaG93SGlkZGVuID8gT2JqZWN0X2dldE93blByb3BlcnR5TmFtZXModmFsdWUpIDogdmlzaWJsZV9rZXlzO1xuXG4gICAgLy8gRnVuY3Rpb25zIHdpdGhvdXQgcHJvcGVydGllcyBjYW4gYmUgc2hvcnRjdXR0ZWQuXG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJyAmJiBrZXlzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgICAgICByZXR1cm4gc3R5bGl6ZSgnJyArIHZhbHVlLCAncmVnZXhwJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgbmFtZSA9IHZhbHVlLm5hbWUgPyAnOiAnICsgdmFsdWUubmFtZSA6ICcnO1xuICAgICAgICByZXR1cm4gc3R5bGl6ZSgnW0Z1bmN0aW9uJyArIG5hbWUgKyAnXScsICdzcGVjaWFsJyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gRGF0ZXMgd2l0aG91dCBwcm9wZXJ0aWVzIGNhbiBiZSBzaG9ydGN1dHRlZFxuICAgIGlmIChpc0RhdGUodmFsdWUpICYmIGtleXMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gc3R5bGl6ZSh2YWx1ZS50b1VUQ1N0cmluZygpLCAnZGF0ZScpO1xuICAgIH1cblxuICAgIHZhciBiYXNlLCB0eXBlLCBicmFjZXM7XG4gICAgLy8gRGV0ZXJtaW5lIHRoZSBvYmplY3QgdHlwZVxuICAgIGlmIChpc0FycmF5KHZhbHVlKSkge1xuICAgICAgdHlwZSA9ICdBcnJheSc7XG4gICAgICBicmFjZXMgPSBbJ1snLCAnXSddO1xuICAgIH0gZWxzZSB7XG4gICAgICB0eXBlID0gJ09iamVjdCc7XG4gICAgICBicmFjZXMgPSBbJ3snLCAnfSddO1xuICAgIH1cblxuICAgIC8vIE1ha2UgZnVuY3Rpb25zIHNheSB0aGF0IHRoZXkgYXJlIGZ1bmN0aW9uc1xuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHZhciBuID0gdmFsdWUubmFtZSA/ICc6ICcgKyB2YWx1ZS5uYW1lIDogJyc7XG4gICAgICBiYXNlID0gKGlzUmVnRXhwKHZhbHVlKSkgPyAnICcgKyB2YWx1ZSA6ICcgW0Z1bmN0aW9uJyArIG4gKyAnXSc7XG4gICAgfSBlbHNlIHtcbiAgICAgIGJhc2UgPSAnJztcbiAgICB9XG5cbiAgICAvLyBNYWtlIGRhdGVzIHdpdGggcHJvcGVydGllcyBmaXJzdCBzYXkgdGhlIGRhdGVcbiAgICBpZiAoaXNEYXRlKHZhbHVlKSkge1xuICAgICAgYmFzZSA9ICcgJyArIHZhbHVlLnRvVVRDU3RyaW5nKCk7XG4gICAgfVxuXG4gICAgaWYgKGtleXMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gYnJhY2VzWzBdICsgYmFzZSArIGJyYWNlc1sxXTtcbiAgICB9XG5cbiAgICBpZiAocmVjdXJzZVRpbWVzIDwgMCkge1xuICAgICAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgICAgICByZXR1cm4gc3R5bGl6ZSgnJyArIHZhbHVlLCAncmVnZXhwJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gc3R5bGl6ZSgnW09iamVjdF0nLCAnc3BlY2lhbCcpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHNlZW4ucHVzaCh2YWx1ZSk7XG5cbiAgICB2YXIgb3V0cHV0ID0ga2V5cy5tYXAoZnVuY3Rpb24oa2V5KSB7XG4gICAgICB2YXIgbmFtZSwgc3RyO1xuICAgICAgaWYgKHZhbHVlLl9fbG9va3VwR2V0dGVyX18pIHtcbiAgICAgICAgaWYgKHZhbHVlLl9fbG9va3VwR2V0dGVyX18oa2V5KSkge1xuICAgICAgICAgIGlmICh2YWx1ZS5fX2xvb2t1cFNldHRlcl9fKGtleSkpIHtcbiAgICAgICAgICAgIHN0ciA9IHN0eWxpemUoJ1tHZXR0ZXIvU2V0dGVyXScsICdzcGVjaWFsJyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN0ciA9IHN0eWxpemUoJ1tHZXR0ZXJdJywgJ3NwZWNpYWwnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKHZhbHVlLl9fbG9va3VwU2V0dGVyX18oa2V5KSkge1xuICAgICAgICAgICAgc3RyID0gc3R5bGl6ZSgnW1NldHRlcl0nLCAnc3BlY2lhbCcpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHZpc2libGVfa2V5cy5pbmRleE9mKGtleSkgPCAwKSB7XG4gICAgICAgIG5hbWUgPSAnWycgKyBrZXkgKyAnXSc7XG4gICAgICB9XG4gICAgICBpZiAoIXN0cikge1xuICAgICAgICBpZiAoc2Vlbi5pbmRleE9mKHZhbHVlW2tleV0pIDwgMCkge1xuICAgICAgICAgIGlmIChyZWN1cnNlVGltZXMgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHN0ciA9IGZvcm1hdCh2YWx1ZVtrZXldKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3RyID0gZm9ybWF0KHZhbHVlW2tleV0sIHJlY3Vyc2VUaW1lcyAtIDEpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoc3RyLmluZGV4T2YoJ1xcbicpID4gLTEpIHtcbiAgICAgICAgICAgIGlmIChpc0FycmF5KHZhbHVlKSkge1xuICAgICAgICAgICAgICBzdHIgPSBzdHIuc3BsaXQoJ1xcbicpLm1hcChmdW5jdGlvbihsaW5lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICcgICcgKyBsaW5lO1xuICAgICAgICAgICAgICB9KS5qb2luKCdcXG4nKS5zdWJzdHIoMik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBzdHIgPSAnXFxuJyArIHN0ci5zcGxpdCgnXFxuJykubWFwKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJyAgICcgKyBsaW5lO1xuICAgICAgICAgICAgICB9KS5qb2luKCdcXG4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3RyID0gc3R5bGl6ZSgnW0NpcmN1bGFyXScsICdzcGVjaWFsJyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgbmFtZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgaWYgKHR5cGUgPT09ICdBcnJheScgJiYga2V5Lm1hdGNoKC9eXFxkKyQvKSkge1xuICAgICAgICAgIHJldHVybiBzdHI7XG4gICAgICAgIH1cbiAgICAgICAgbmFtZSA9IEpTT04uc3RyaW5naWZ5KCcnICsga2V5KTtcbiAgICAgICAgaWYgKG5hbWUubWF0Y2goL15cIihbYS16QS1aX11bYS16QS1aXzAtOV0qKVwiJC8pKSB7XG4gICAgICAgICAgbmFtZSA9IG5hbWUuc3Vic3RyKDEsIG5hbWUubGVuZ3RoIC0gMik7XG4gICAgICAgICAgbmFtZSA9IHN0eWxpemUobmFtZSwgJ25hbWUnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBuYW1lID0gbmFtZS5yZXBsYWNlKC8nL2csIFwiXFxcXCdcIilcbiAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXFxcXCIvZywgJ1wiJylcbiAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8oXlwifFwiJCkvZywgXCInXCIpO1xuICAgICAgICAgIG5hbWUgPSBzdHlsaXplKG5hbWUsICdzdHJpbmcnKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gbmFtZSArICc6ICcgKyBzdHI7XG4gICAgfSk7XG5cbiAgICBzZWVuLnBvcCgpO1xuXG4gICAgdmFyIG51bUxpbmVzRXN0ID0gMDtcbiAgICB2YXIgbGVuZ3RoID0gb3V0cHV0LnJlZHVjZShmdW5jdGlvbihwcmV2LCBjdXIpIHtcbiAgICAgIG51bUxpbmVzRXN0Kys7XG4gICAgICBpZiAoY3VyLmluZGV4T2YoJ1xcbicpID49IDApIG51bUxpbmVzRXN0Kys7XG4gICAgICByZXR1cm4gcHJldiArIGN1ci5sZW5ndGggKyAxO1xuICAgIH0sIDApO1xuXG4gICAgaWYgKGxlbmd0aCA+IDUwKSB7XG4gICAgICBvdXRwdXQgPSBicmFjZXNbMF0gK1xuICAgICAgICAgICAgICAgKGJhc2UgPT09ICcnID8gJycgOiBiYXNlICsgJ1xcbiAnKSArXG4gICAgICAgICAgICAgICAnICcgK1xuICAgICAgICAgICAgICAgb3V0cHV0LmpvaW4oJyxcXG4gICcpICtcbiAgICAgICAgICAgICAgICcgJyArXG4gICAgICAgICAgICAgICBicmFjZXNbMV07XG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0cHV0ID0gYnJhY2VzWzBdICsgYmFzZSArICcgJyArIG91dHB1dC5qb2luKCcsICcpICsgJyAnICsgYnJhY2VzWzFdO1xuICAgIH1cblxuICAgIHJldHVybiBvdXRwdXQ7XG4gIH1cbiAgcmV0dXJuIGZvcm1hdChvYmosICh0eXBlb2YgZGVwdGggPT09ICd1bmRlZmluZWQnID8gMiA6IGRlcHRoKSk7XG59O1xuXG5cbmZ1bmN0aW9uIGlzQXJyYXkoYXIpIHtcbiAgcmV0dXJuIEFycmF5LmlzQXJyYXkoYXIpIHx8XG4gICAgICAgICAodHlwZW9mIGFyID09PSAnb2JqZWN0JyAmJiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoYXIpID09PSAnW29iamVjdCBBcnJheV0nKTtcbn1cblxuXG5mdW5jdGlvbiBpc1JlZ0V4cChyZSkge1xuICB0eXBlb2YgcmUgPT09ICdvYmplY3QnICYmIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChyZSkgPT09ICdbb2JqZWN0IFJlZ0V4cF0nO1xufVxuXG5cbmZ1bmN0aW9uIGlzRGF0ZShkKSB7XG4gIHJldHVybiB0eXBlb2YgZCA9PT0gJ29iamVjdCcgJiYgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGQpID09PSAnW29iamVjdCBEYXRlXSc7XG59XG5cbmZ1bmN0aW9uIHBhZChuKSB7XG4gIHJldHVybiBuIDwgMTAgPyAnMCcgKyBuLnRvU3RyaW5nKDEwKSA6IG4udG9TdHJpbmcoMTApO1xufVxuXG52YXIgbW9udGhzID0gWydKYW4nLCAnRmViJywgJ01hcicsICdBcHInLCAnTWF5JywgJ0p1bicsICdKdWwnLCAnQXVnJywgJ1NlcCcsXG4gICAgICAgICAgICAgICdPY3QnLCAnTm92JywgJ0RlYyddO1xuXG4vLyAyNiBGZWIgMTY6MTk6MzRcbmZ1bmN0aW9uIHRpbWVzdGFtcCgpIHtcbiAgdmFyIGQgPSBuZXcgRGF0ZSgpO1xuICB2YXIgdGltZSA9IFtwYWQoZC5nZXRIb3VycygpKSxcbiAgICAgICAgICAgICAgcGFkKGQuZ2V0TWludXRlcygpKSxcbiAgICAgICAgICAgICAgcGFkKGQuZ2V0U2Vjb25kcygpKV0uam9pbignOicpO1xuICByZXR1cm4gW2QuZ2V0RGF0ZSgpLCBtb250aHNbZC5nZXRNb250aCgpXSwgdGltZV0uam9pbignICcpO1xufVxuXG5leHBvcnRzLmxvZyA9IGZ1bmN0aW9uIChtc2cpIHt9O1xuXG5leHBvcnRzLnB1bXAgPSBudWxsO1xuXG52YXIgT2JqZWN0X2tleXMgPSBPYmplY3Qua2V5cyB8fCBmdW5jdGlvbiAob2JqKSB7XG4gICAgdmFyIHJlcyA9IFtdO1xuICAgIGZvciAodmFyIGtleSBpbiBvYmopIHJlcy5wdXNoKGtleSk7XG4gICAgcmV0dXJuIHJlcztcbn07XG5cbnZhciBPYmplY3RfZ2V0T3duUHJvcGVydHlOYW1lcyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzIHx8IGZ1bmN0aW9uIChvYmopIHtcbiAgICB2YXIgcmVzID0gW107XG4gICAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgICAgICBpZiAoT2JqZWN0Lmhhc093blByb3BlcnR5LmNhbGwob2JqLCBrZXkpKSByZXMucHVzaChrZXkpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzO1xufTtcblxudmFyIE9iamVjdF9jcmVhdGUgPSBPYmplY3QuY3JlYXRlIHx8IGZ1bmN0aW9uIChwcm90b3R5cGUsIHByb3BlcnRpZXMpIHtcbiAgICAvLyBmcm9tIGVzNS1zaGltXG4gICAgdmFyIG9iamVjdDtcbiAgICBpZiAocHJvdG90eXBlID09PSBudWxsKSB7XG4gICAgICAgIG9iamVjdCA9IHsgJ19fcHJvdG9fXycgOiBudWxsIH07XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBpZiAodHlwZW9mIHByb3RvdHlwZSAhPT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgICAgICAgICAgICAgJ3R5cGVvZiBwcm90b3R5cGVbJyArICh0eXBlb2YgcHJvdG90eXBlKSArICddICE9IFxcJ29iamVjdFxcJydcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIFR5cGUgPSBmdW5jdGlvbiAoKSB7fTtcbiAgICAgICAgVHlwZS5wcm90b3R5cGUgPSBwcm90b3R5cGU7XG4gICAgICAgIG9iamVjdCA9IG5ldyBUeXBlKCk7XG4gICAgICAgIG9iamVjdC5fX3Byb3RvX18gPSBwcm90b3R5cGU7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgcHJvcGVydGllcyAhPT0gJ3VuZGVmaW5lZCcgJiYgT2JqZWN0LmRlZmluZVByb3BlcnRpZXMpIHtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXMob2JqZWN0LCBwcm9wZXJ0aWVzKTtcbiAgICB9XG4gICAgcmV0dXJuIG9iamVjdDtcbn07XG5cbmV4cG9ydHMuaW5oZXJpdHMgPSBmdW5jdGlvbihjdG9yLCBzdXBlckN0b3IpIHtcbiAgY3Rvci5zdXBlcl8gPSBzdXBlckN0b3I7XG4gIGN0b3IucHJvdG90eXBlID0gT2JqZWN0X2NyZWF0ZShzdXBlckN0b3IucHJvdG90eXBlLCB7XG4gICAgY29uc3RydWN0b3I6IHtcbiAgICAgIHZhbHVlOiBjdG9yLFxuICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH1cbiAgfSk7XG59O1xuXG52YXIgZm9ybWF0UmVnRXhwID0gLyVbc2RqJV0vZztcbmV4cG9ydHMuZm9ybWF0ID0gZnVuY3Rpb24oZikge1xuICBpZiAodHlwZW9mIGYgIT09ICdzdHJpbmcnKSB7XG4gICAgdmFyIG9iamVjdHMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgb2JqZWN0cy5wdXNoKGV4cG9ydHMuaW5zcGVjdChhcmd1bWVudHNbaV0pKTtcbiAgICB9XG4gICAgcmV0dXJuIG9iamVjdHMuam9pbignICcpO1xuICB9XG5cbiAgdmFyIGkgPSAxO1xuICB2YXIgYXJncyA9IGFyZ3VtZW50cztcbiAgdmFyIGxlbiA9IGFyZ3MubGVuZ3RoO1xuICB2YXIgc3RyID0gU3RyaW5nKGYpLnJlcGxhY2UoZm9ybWF0UmVnRXhwLCBmdW5jdGlvbih4KSB7XG4gICAgaWYgKHggPT09ICclJScpIHJldHVybiAnJSc7XG4gICAgaWYgKGkgPj0gbGVuKSByZXR1cm4geDtcbiAgICBzd2l0Y2ggKHgpIHtcbiAgICAgIGNhc2UgJyVzJzogcmV0dXJuIFN0cmluZyhhcmdzW2krK10pO1xuICAgICAgY2FzZSAnJWQnOiByZXR1cm4gTnVtYmVyKGFyZ3NbaSsrXSk7XG4gICAgICBjYXNlICclaic6IHJldHVybiBKU09OLnN0cmluZ2lmeShhcmdzW2krK10pO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIHg7XG4gICAgfVxuICB9KTtcbiAgZm9yKHZhciB4ID0gYXJnc1tpXTsgaSA8IGxlbjsgeCA9IGFyZ3NbKytpXSl7XG4gICAgaWYgKHggPT09IG51bGwgfHwgdHlwZW9mIHggIT09ICdvYmplY3QnKSB7XG4gICAgICBzdHIgKz0gJyAnICsgeDtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RyICs9ICcgJyArIGV4cG9ydHMuaW5zcGVjdCh4KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHN0cjtcbn07XG4iLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcblxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG5wcm9jZXNzLm5leHRUaWNrID0gKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY2FuU2V0SW1tZWRpYXRlID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAmJiB3aW5kb3cuc2V0SW1tZWRpYXRlO1xuICAgIHZhciBjYW5Qb3N0ID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAmJiB3aW5kb3cucG9zdE1lc3NhZ2UgJiYgd2luZG93LmFkZEV2ZW50TGlzdGVuZXJcbiAgICA7XG5cbiAgICBpZiAoY2FuU2V0SW1tZWRpYXRlKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoZikgeyByZXR1cm4gd2luZG93LnNldEltbWVkaWF0ZShmKSB9O1xuICAgIH1cblxuICAgIGlmIChjYW5Qb3N0KSB7XG4gICAgICAgIHZhciBxdWV1ZSA9IFtdO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGZ1bmN0aW9uIChldikge1xuICAgICAgICAgICAgaWYgKGV2LnNvdXJjZSA9PT0gd2luZG93ICYmIGV2LmRhdGEgPT09ICdwcm9jZXNzLXRpY2snKSB7XG4gICAgICAgICAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgaWYgKHF1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZuID0gcXVldWUuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICAgICAgZm4oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHRydWUpO1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICAgICAgcXVldWUucHVzaChmbik7XG4gICAgICAgICAgICB3aW5kb3cucG9zdE1lc3NhZ2UoJ3Byb2Nlc3MtdGljaycsICcqJyk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZm4sIDApO1xuICAgIH07XG59KSgpO1xuXG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59XG5cbi8vIFRPRE8oc2h0eWxtYW4pXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbiJdfQ==
;
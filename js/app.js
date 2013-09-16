require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var ChordDiagram, Chords, Layout, Scale, Scales, app, best_fingering_for, finger_positions_on_chord, fingerings_for, _ref, _ref1;

ChordDiagram = require('./chord_diagram');

Layout = require('./layout');

_ref = require('./fretboard_logic'), best_fingering_for = _ref.best_fingering_for, fingerings_for = _ref.fingerings_for, finger_positions_on_chord = _ref.finger_positions_on_chord;

_ref1 = require('./theory'), Chords = _ref1.Chords, Scale = _ref1.Scale, Scales = _ref1.Scales;

angular.element(document).ready(function() {
  return angular.bootstrap(document, ['FretboardApp']);
});

app = angular.module('FretboardApp', []);

app.controller('ChordCtrl', function($scope) {
  return $scope.getScaleChords = function(scaleName) {
    return Scale.find(scaleName).chords().map(function(chord) {
      return chord.name;
    });
  };
});

app.directive('chord', function() {
  return {
    restrict: 'CE',
    replace: true,
    template: '<canvas width="90" height="100"/>',
    transclude: true,
    scope: {
      name: '@'
    },
    link: function(scope, element, attrs) {
      var canvas;
      canvas = element[0];
      return attrs.$observe('name', function(chordName) {
        var chord, ctx, fingering, fingerings;
        chord = Chords.Major.at(chordName);
        fingerings = fingerings_for(chord);
        fingering = fingerings[0];
        ctx = canvas.getContext('2d');
        return ChordDiagram.draw(ctx, fingering.positions, {
          barres: fingering.barres
        });
      });
    }
  };
});


},{"./chord_diagram":"kgIvBT","./fretboard_logic":"YoMTGX","./layout":"ThjNWR","./theory":"AmyBcu"}],"8QyYb9":[function(require,module,exports){



},{}],"kgIvBT":[function(require,module,exports){
var DefaultStyle, FretCount, FretNumbers, Layout, SmallStyle, StringCount, StringNumbers, compute_dimensions, draw_chord_block, draw_chord_diagram, draw_chord_diagram_frets, draw_chord_diagram_strings, hsv2css, _, _ref,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

_ = require('underscore');

_ref = require('./fretboard_model'), FretCount = _ref.FretCount, FretNumbers = _ref.FretNumbers, StringCount = _ref.StringCount, StringNumbers = _ref.StringNumbers;

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
  interval_class_colors: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(function(n) {
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

compute_dimensions = function(style) {
  if (style == null) {
    style = DefaultStyle;
  }
  return {
    width: 2 * style.h_gutter + (StringCount - 1) * style.string_spacing,
    height: 2 * style.v_gutter + (style.fret_height + 2) * FretCount
  };
};

draw_chord_diagram_strings = function(ctx, options) {
  var string, style, x, _i, _len, _results;
  if (options == null) {
    options = {};
  }
  style = DefaultStyle;
  _results = [];
  for (_i = 0, _len = StringNumbers.length; _i < _len; _i++) {
    string = StringNumbers[_i];
    x = string * style.string_spacing + style.h_gutter;
    ctx.beginPath();
    ctx.moveTo(x, style.v_gutter + style.above_fretboard);
    ctx.lineTo(x, style.v_gutter + style.above_fretboard + FretCount * style.fret_height);
    ctx.strokeStyle = (options.dim_strings && __indexOf.call(options.dim_strings, string) >= 0 ? 'rgba(0,0,0,0.2)' : 'black');
    _results.push(ctx.stroke());
  }
  return _results;
};

draw_chord_diagram_frets = function(ctx, _arg) {
  var fret, nut, style, y, _i, _len, _results;
  nut = (_arg != null ? _arg : {
    nut: true
  }).nut;
  style = DefaultStyle;
  ctx.strokeStyle = 'black';
  _results = [];
  for (_i = 0, _len = FretNumbers.length; _i < _len; _i++) {
    fret = FretNumbers[_i];
    y = style.v_gutter + style.above_fretboard + fret * style.fret_height;
    ctx.beginPath();
    ctx.moveTo(style.v_gutter - 0.5, y);
    ctx.lineTo(style.v_gutter + 0.5 + (StringCount - 1) * style.string_spacing, y);
    if (fret === 0 && nut) {
      ctx.lineWidth = 3;
    }
    ctx.stroke();
    _results.push(ctx.lineWidth = 1);
  }
  return _results;
};

draw_chord_diagram = function(ctx, positions, options) {
  var barres, defaults, draw_barres, draw_closed_strings, draw_finger_position, draw_finger_positions, dy, finger_coordinates, string, style, used_strings;
  if (options == null) {
    options = {};
  }
  defaults = {
    draw_closed_strings: true,
    nut: true,
    dy: 0,
    style: DefaultStyle
  };
  options = _.extend(defaults, options);
  barres = options.barres, dy = options.dy, draw_closed_strings = options.draw_closed_strings, style = options.style;
  if (options.dim_unused_strings) {
    used_strings = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = positions.length; _i < _len; _i++) {
        string = positions[_i].string;
        _results.push(string);
      }
      return _results;
    })();
    options.dim_strings = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = StringNumbers.length; _i < _len; _i++) {
        string = StringNumbers[_i];
        if (__indexOf.call(used_strings, string) < 0) {
          _results.push(string);
        }
      }
      return _results;
    })();
  }
  finger_coordinates = function(_arg) {
    var fret, string;
    string = _arg.string, fret = _arg.fret;
    return {
      x: style.h_gutter + string * style.string_spacing,
      y: style.v_gutter + style.above_fretboard + (fret - 0.5) * style.fret_height + dy
    };
  };
  draw_finger_position = function(position, options) {
    var color, is_root, x, y, _ref1;
    if (options == null) {
      options = {};
    }
    is_root = options.is_root, color = options.color;
    _ref1 = finger_coordinates(position), x = _ref1.x, y = _ref1.y;
    ctx.fillStyle = color || (is_root ? 'red' : 'white');
    ctx.strokeStyle = color || (is_root ? 'red' : 'black');
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (is_root && position.fret) {
      (function(r) {
        return ctx.rect(x - r, y - r, 2 * r, 2 * r);
      })(style.note_radius);
    } else {
      ctx.arc(x, y, style.note_radius, 0, Math.PI * 2, false);
    }
    if (position.fret > 0 || is_root) {
      ctx.fill();
    }
    return ctx.stroke();
  };
  draw_barres = function() {
    var eccentricity, fret, string_count, w, x1, x2, y, _fn, _fn1, _i, _len, _ref1, _ref2, _results;
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
      _ref1 = barres[_i], fret = _ref1.fret, string = _ref1.string, fret = _ref1.fret, string_count = _ref1.string_count;
      _ref2 = finger_coordinates({
        string: string,
        fret: fret
      }), x1 = _ref2.x, y = _ref2.y;
      x2 = finger_coordinates({
        string: string + string_count - 1,
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
  draw_finger_positions = function() {
    var default_options, position, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = positions.length; _i < _len; _i++) {
      position = positions[_i];
      default_options = {
        color: style.interval_class_colors[position.interval_class],
        is_root: position.interval_class === 0
      };
      _results.push(draw_finger_position(position, _.extend(default_options, position)));
    }
    return _results;
  };
  draw_closed_strings = function() {
    var closed_strings, fretted_strings, position, r, x, y, _i, _j, _len, _len1, _ref1, _results;
    fretted_strings = [];
    for (_i = 0, _len = positions.length; _i < _len; _i++) {
      position = positions[_i];
      fretted_strings[position.string] = true;
    }
    closed_strings = (function() {
      var _j, _len1, _results;
      _results = [];
      for (_j = 0, _len1 = StringNumbers.length; _j < _len1; _j++) {
        string = StringNumbers[_j];
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
      _ref1 = finger_coordinates({
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
  draw_chord_diagram_strings(ctx, options);
  draw_chord_diagram_frets(ctx, {
    nut: options.nut
  });
  if (barres) {
    draw_barres();
  }
  if (positions) {
    draw_finger_positions();
  }
  if (positions && options.draw_closed_strings) {
    return draw_closed_strings();
  }
};

draw_chord_block = function(positions, options) {
  var dimensions;
  dimensions = compute_dimensions();
  return Layout.block({
    width: dimensions.width,
    height: dimensions.height,
    draw: function() {
      return Layout.with_graphics_context(function(ctx) {
        ctx.translate(0, -dimensions.height);
        return draw_chord_diagram(ctx, positions, options);
      });
    }
  });
};

module.exports = {
  defaultStyle: DefaultStyle,
  width: compute_dimensions().width,
  height: compute_dimensions().height,
  draw: draw_chord_diagram,
  block: draw_chord_block
};


},{"./fretboard_model":"dVmYil","./layout":"ThjNWR","./utils":"VD5hCQ","underscore":24}],"JjUvl1":[function(require,module,exports){
var DefaultStyle, FretCount, FretNumbers, StringCount, StringNumbers, draw_fretboard, draw_fretboard_finger_position, draw_fretboard_frets, draw_fretboard_strings, padded_fretboard_height, padded_fretboard_width, _ref;

_ref = require('./fretboard_model'), FretCount = _ref.FretCount, FretNumbers = _ref.FretNumbers, StringCount = _ref.StringCount, StringNumbers = _ref.StringNumbers;

DefaultStyle = {
  h_gutter: 10,
  v_gutter: 10,
  string_spacing: 20,
  fret_width: 45,
  fret_overhang: .3 * 45
};

padded_fretboard_width = (function(style) {
  return 2 * style.v_gutter + style.fret_width * FretCount + style.fret_overhang;
})(DefaultStyle);

padded_fretboard_height = (function(style) {
  return 2 * style.h_gutter + (StringCount - 1) * style.string_spacing;
})(DefaultStyle);

draw_fretboard_strings = function(ctx) {
  var string, style, y, _i, _len, _results;
  style = DefaultStyle;
  _results = [];
  for (_i = 0, _len = StringNumbers.length; _i < _len; _i++) {
    string = StringNumbers[_i];
    y = string * style.string_spacing + style.h_gutter;
    ctx.beginPath();
    ctx.moveTo(style.h_gutter, y);
    ctx.lineTo(style.h_gutter + FretCount * style.fret_width + style.fret_overhang, y);
    ctx.lineWidth = 1;
    _results.push(ctx.stroke());
  }
  return _results;
};

draw_fretboard_frets = function(ctx) {
  var fret, style, x, _i, _len, _results;
  style = DefaultStyle;
  _results = [];
  for (_i = 0, _len = FretNumbers.length; _i < _len; _i++) {
    fret = FretNumbers[_i];
    x = style.h_gutter + fret * style.fret_width;
    ctx.beginPath();
    ctx.moveTo(x, style.h_gutter);
    ctx.lineTo(x, style.h_gutter + (StringCount - 1) * style.string_spacing);
    if (fret === 0) {
      ctx.lineWidth = 3;
    }
    ctx.stroke();
    _results.push(ctx.lineWidth = 1);
  }
  return _results;
};

draw_fretboard_finger_position = function(ctx, position, options) {
  var color, fret, is_root, string, style, x, y;
  if (options == null) {
    options = {};
  }
  string = position.string, fret = position.fret;
  is_root = options.is_root, color = options.color;
  style = DefaultStyle;
  color || (color = is_root ? 'red' : 'white');
  x = style.h_gutter + (fret - 0.5) * style.fret_width;
  if (fret === 0) {
    x = style.h_gutter;
  }
  y = style.v_gutter + (5 - string) * style.string_spacing;
  ctx.beginPath();
  ctx.arc(x, y, 7, 0, 2 * Math.PI, false);
  ctx.fillStyle = color;
  if (!is_root) {
    ctx.lineWidth = 2;
  }
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = 'black';
  return ctx.lineWidth = 1;
};

draw_fretboard = function(ctx, positions) {
  var position, _i, _len, _ref1, _results;
  draw_fretboard_strings(ctx);
  draw_fretboard_frets(ctx);
  _ref1 = positions || [];
  _results = [];
  for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
    position = _ref1[_i];
    _results.push(draw_fretboard_finger_position(ctx, position, position));
  }
  return _results;
};

module.exports = {
  draw: draw_fretboard,
  height: padded_fretboard_height,
  width: padded_fretboard_width
};


},{"./fretboard_model":"dVmYil"}],"YoMTGX":[function(require,module,exports){
var Fingering, FretNumbers, FretboardModel, OpenStringPitches, StringNumbers, best_fingering_for, find_barre_sets, find_barres, finger_positions_on_chord, fingerings_for, fretboard_positions_each, interval_class_between, pitch_number_for_position, util, _,
  __slice = [].slice;

util = require('util');

_ = require('underscore');

interval_class_between = require('./theory').interval_class_between;

FretboardModel = require('./fretboard_model');

FretNumbers = FretboardModel.FretNumbers, OpenStringPitches = FretboardModel.OpenStringPitches, StringNumbers = FretboardModel.StringNumbers, fretboard_positions_each = FretboardModel.fretboard_positions_each, pitch_number_for_position = FretboardModel.pitch_number_for_position;

require('./utils');

Fingering = (function() {
  function Fingering(_arg) {
    this.positions = _arg.positions, this.chord = _arg.chord, this.barres = _arg.barres;
    this.positions.sort(function(a, b) {
      return a.string - b.string;
    });
  }

  Fingering.cached_getter('fretstring', function() {
    var fret, fret_vector, s, string, x, _i, _len, _ref, _ref1;
    fret_vector = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = StringNumbers.length; _i < _len; _i++) {
        s = StringNumbers[_i];
        _results.push(-1);
      }
      return _results;
    })();
    _ref = this.positions;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      _ref1 = _ref[_i], string = _ref1.string, fret = _ref1.fret;
      fret_vector[string] = fret;
    }
    return ((function() {
      var _j, _len1, _results;
      _results = [];
      for (_j = 0, _len1 = fret_vector.length; _j < _len1; _j++) {
        x = fret_vector[_j];
        _results.push(x >= 0 ? x : 'x');
      }
      return _results;
    })()).join('');
  });

  Fingering.cached_getter('inversion', function() {
    return this.chord.pitch_classes.indexOf(interval_class_between(this.chord.root, pitch_number_for_position(this.positions[0])));
  });

  return Fingering;

})();

find_barres = function(positions) {
  var barres, fn, fp, fret_rows, m, sn, _i, _len;
  fret_rows = (function() {
    var _i, _len, _results;
    _results = [];
    for (_i = 0, _len = FretNumbers.length; _i < _len; _i++) {
      fn = FretNumbers[_i];
      _results.push(((function() {
        var _j, _len1, _results1;
        _results1 = [];
        for (_j = 0, _len1 = StringNumbers.length; _j < _len1; _j++) {
          sn = StringNumbers[_j];
          if (_.find(positions, function(pos) {
            return pos.string === sn && pos.fret > fn;
          })) {
            _results1.push('.');
          } else if (_.find(positions, function(pos) {
            return pos.string === sn && pos.fret < fn;
          })) {
            _results1.push('-');
          } else if (_.find(positions, function(pos) {
            return pos.string === sn && pos.fret === fn;
          })) {
            _results1.push('x');
          } else {
            _results1.push(' ');
          }
        }
        return _results1;
      })()).join(''));
    }
    return _results;
  })();
  barres = [];
  for (fn = _i = 0, _len = fret_rows.length; _i < _len; fn = ++_i) {
    fp = fret_rows[fn];
    if (fn === 0) {
      continue;
    }
    m = fp.match(/^[^x]*(x[\.x]+x\.*)$/);
    if (!m) {
      continue;
    }
    barres.push({
      fret: fn,
      string: m[0].length - m[1].length,
      string_count: m[1].length,
      subsumption_count: m[1].match(/x/g).length
    });
  }
  return barres;
};

find_barre_sets = function(positions) {
  var barres, powerset;
  powerset = function(xs) {
    var tail, x, ys, _ref;
    if (!xs.length) {
      return [[]];
    }
    _ref = xs, x = _ref[0], xs = 2 <= _ref.length ? __slice.call(_ref, 1) : [];
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
  barres = find_barres(positions);
  return powerset(barres);
};

finger_positions_on_chord = function(chord) {
  var positions;
  positions = [];
  fretboard_positions_each(function(pos) {
    var degree_index, interval_class;
    interval_class = interval_class_between(chord.root, pitch_number_for_position(pos));
    degree_index = chord.pitch_classes.indexOf(interval_class);
    if (degree_index >= 0) {
      return positions.push({
        string: pos.string,
        fret: pos.fret,
        interval_class: interval_class,
        degree_index: degree_index
      });
    }
  });
  return positions;
};

fingerings_for = function(chord, options) {
  var chord_name, chord_note_count, cmp, collect_fingering_positions, count_distinct_notes, filter_fingerings, filters, finger_count, fingerings, four_fingers_or_fewer, frets_per_string, generate_fingerings, has_all_notes, high_note_count, is_root_position, muted_medial_strings, muted_treble_strings, positions, preferences, reverse_sort_key, sort_fingerings, warn, __;
  if (options == null) {
    options = {};
  }
  options = _.extend({
    filter: true
  }, options);
  warn = false;
  if (chord.root == null) {
    throw new Error("No root for " + (util.inspect(chord)));
  }
  positions = finger_positions_on_chord(chord);
  frets_per_string = (function(strings) {
    var position, _i, _len;
    for (_i = 0, _len = positions.length; _i < _len; _i++) {
      position = positions[_i];
      strings[position.string].push(position);
    }
    return strings;
  })((function() {
    var _i, _len, _results;
    _results = [];
    for (_i = 0, _len = OpenStringPitches.length; _i < _len; _i++) {
      __ = OpenStringPitches[_i];
      _results.push([]);
    }
    return _results;
  })());
  collect_fingering_positions = function(string_frets) {
    var following_finger_positions, frets, n, right;
    if (!string_frets.length) {
      return [[]];
    }
    frets = string_frets[0];
    following_finger_positions = collect_fingering_positions(string_frets.slice(1));
    return following_finger_positions.concat.apply(following_finger_positions, (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = following_finger_positions.length; _i < _len; _i++) {
        right = following_finger_positions[_i];
        _results.push((function() {
          var _j, _len1, _results1;
          _results1 = [];
          for (_j = 0, _len1 = frets.length; _j < _len1; _j++) {
            n = frets[_j];
            _results1.push([n].concat(right));
          }
          return _results1;
        })());
      }
      return _results;
    })());
  };
  generate_fingerings = function() {
    var barres;
    return _.flatten((function() {
      var _i, _len, _ref, _results;
      _ref = collect_fingering_positions(frets_per_string);
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        positions = _ref[_i];
        _results.push((function() {
          var _j, _len1, _ref1, _results1;
          _ref1 = find_barre_sets(positions);
          _results1 = [];
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            barres = _ref1[_j];
            _results1.push(new Fingering({
              positions: positions,
              chord: chord,
              barres: barres
            }));
          }
          return _results1;
        })());
      }
      return _results;
    })());
  };
  chord_note_count = chord.pitch_classes.length;
  count_distinct_notes = function(fingering) {
    return _.chain(fingering.positions).pluck('interval_class').uniq().value().length;
  };
  has_all_notes = function(fingering) {
    return count_distinct_notes(fingering) === chord_note_count;
  };
  muted_medial_strings = function(fingering) {
    return fingering.fretstring.match(/\dx+\d/);
  };
  muted_treble_strings = function(fingering) {
    return fingering.fretstring.match(/x$/);
  };
  finger_count = function(fingering) {
    var barre, n, pos, _i, _len, _ref;
    n = ((function() {
      var _i, _len, _ref, _results;
      _ref = fingering.positions;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        pos = _ref[_i];
        if (pos.fret > 0) {
          _results.push(pos);
        }
      }
      return _results;
    })()).length;
    _ref = fingering.barres;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      barre = _ref[_i];
      n -= barre.subsumption_count;
    }
    return n;
  };
  four_fingers_or_fewer = function(fingering) {
    return finger_count(fingering) <= 4;
  };
  cmp = function(fn) {
    return function() {
      var x;
      x = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return !fn.apply(null, x);
    };
  };
  filters = [];
  filters.push({
    name: 'has all chord notes',
    select: has_all_notes
  });
  if (options.filter) {
    filters.push({
      name: 'four fingers or fewer',
      select: four_fingers_or_fewer
    });
  }
  if (!options.fingerpicking) {
    filters.push({
      name: 'no muted medial strings',
      reject: muted_medial_strings
    });
    filters.push({
      name: 'no muted treble strings',
      reject: muted_treble_strings
    });
  }
  filter_fingerings = function(fingerings) {
    var filtered, fingering, name, reject, select, _i, _len, _ref;
    for (_i = 0, _len = filters.length; _i < _len; _i++) {
      _ref = filters[_i], name = _ref.name, select = _ref.select, reject = _ref.reject;
      select || (select = cmp(reject));
      filtered = (function() {
        var _j, _len1, _results;
        _results = [];
        for (_j = 0, _len1 = fingerings.length; _j < _len1; _j++) {
          fingering = fingerings[_j];
          if (select(fingering)) {
            _results.push(fingering);
          }
        }
        return _results;
      })();
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
  high_note_count = function(fingering) {
    return fingering.positions.length;
  };
  is_root_position = function(fingering) {
    return _(fingering.positions).sortBy(function(pos) {
      return pos.string;
    })[0].degree_index === 0;
  };
  reverse_sort_key = function(fn) {
    return function(a) {
      return -fn(a);
    };
  };
  preferences = [
    {
      name: 'root position',
      key: is_root_position
    }, {
      name: 'high note count',
      key: high_note_count
    }, {
      name: 'avoid barres',
      key: reverse_sort_key(function(fingering) {
        return fingering.barres.length;
      })
    }, {
      name: 'low finger count',
      key: reverse_sort_key(finger_count)
    }
  ];
  sort_fingerings = function(fingerings) {
    var key, _i, _len, _ref;
    _ref = preferences.slice(0).reverse();
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      key = _ref[_i].key;
      fingerings = _(fingerings).sortBy(key);
    }
    fingerings.reverse();
    return fingerings;
  };
  chord_name = chord.name;
  fingerings = generate_fingerings();
  fingerings = filter_fingerings(fingerings);
  fingerings = sort_fingerings(fingerings);
  return fingerings;
};

best_fingering_for = function(chord) {
  return fingerings_for(chord)[0];
};

module.exports = {
  best_fingering_for: best_fingering_for,
  fingerings_for: fingerings_for,
  finger_positions_on_chord: finger_positions_on_chord
};


},{"./fretboard_model":"dVmYil","./theory":"AmyBcu","./utils":"VD5hCQ","underscore":24,"util":21}],"dVmYil":[function(require,module,exports){
var FretCount, FretNumbers, OpenStringPitches, StringCount, StringIntervals, StringNumbers, fretboard_positions_each, interval_class_between, intervals_from, pitch_number_for_position;

interval_class_between = require('./theory').interval_class_between;

StringNumbers = [0, 1, 2, 3, 4, 5];

StringCount = StringNumbers.length;

FretNumbers = [0, 1, 2, 3, 4];

FretCount = FretNumbers.length - 1;

StringIntervals = [5, 5, 5, 4, 5];

OpenStringPitches = (function(numbers) {
  var i, interval, _i, _len;
  numbers.push(20);
  for (i = _i = 0, _len = StringIntervals.length; _i < _len; i = ++_i) {
    interval = StringIntervals[i];
    numbers.push(numbers[i] + interval);
  }
  return numbers;
})([]);

pitch_number_for_position = function(_arg) {
  var fret, string;
  string = _arg.string, fret = _arg.fret;
  return OpenStringPitches[string] + fret;
};

fretboard_positions_each = function(fn) {
  var fret, string, _i, _len, _results;
  _results = [];
  for (_i = 0, _len = StringNumbers.length; _i < _len; _i++) {
    string = StringNumbers[_i];
    _results.push((function() {
      var _j, _len1, _results1;
      _results1 = [];
      for (_j = 0, _len1 = FretNumbers.length; _j < _len1; _j++) {
        fret = FretNumbers[_j];
        _results1.push(fn({
          string: string,
          fret: fret
        }));
      }
      return _results1;
    })());
  }
  return _results;
};

intervals_from = function(root_position, semitones) {
  var positions, root_note_number;
  root_note_number = pitch_number_for_position(root_position);
  positions = [];
  fretboard_positions_each(function(finger_position) {
    if (interval_class_between(root_note_number, pitch_number_for_position(finger_position)) !== semitones) {
      return;
    }
    return positions.push(finger_position);
  });
  return positions;
};

module.exports = {
  StringNumbers: StringNumbers,
  StringCount: StringCount,
  FretNumbers: FretNumbers,
  FretCount: FretCount,
  OpenStringPitches: OpenStringPitches,
  fretboard_positions_each: fretboard_positions_each,
  pitch_number_for_position: pitch_number_for_position,
  intervals_from: intervals_from
};


},{"./theory":"AmyBcu"}],"L0flg7":[function(require,module,exports){
var ChordDiagram, DefaultStyle, IntervalNames, IntervalVectors, block, draw_harmonic_table, draw_text, harmonic_table_block, interval_class_vectors, with_alignment, with_graphics_context, _, _ref,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

_ = require('underscore');

IntervalNames = require('./theory').IntervalNames;

_ref = require('./layout'), block = _ref.block, draw_text = _ref.draw_text, with_graphics_context = _ref.with_graphics_context, with_alignment = _ref.with_alignment;

ChordDiagram = require('./chord_diagram');

DefaultStyle = {
  interval_class_colors: ChordDiagram.defaultStyle.interval_class_colors,
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

interval_class_vectors = function(interval_class) {
  var adjust, adjustments, computed_semitones, intervals, k, original_interval_class, record, sign, v, _ref1, _ref2;
  original_interval_class = interval_class;
  adjustments = {};
  adjust = function(d_ic, intervals) {
    var k, v, _results;
    interval_class += d_ic;
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
  while (interval_class >= 24) {
    adjust(-24, {
      P5: 4,
      M3: -1
    });
  }
  while (interval_class >= 12) {
    adjust(-12, {
      M3: 3
    });
  }
  _ref1 = [IntervalVectors[interval_class], 1], record = _ref1[0], sign = _ref1[1];
  if (!record) {
    _ref2 = [IntervalVectors[12 - interval_class], -1], record = _ref2[0], sign = _ref2[1];
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
  if (computed_semitones !== original_interval_class % 12) {
    console.error("Error computing grid position for " + original_interval_class + ":\n", "  " + original_interval_class + " ->", intervals, '->', computed_semitones, '!=', original_interval_class % 12);
  }
  return intervals;
};

draw_harmonic_table = function(interval_classes, options) {
  var bounds, cell_center, cell_radius, colors, hex_radius, interval_klass, x, y, _i, _len, _ref1;
  if (options == null) {
    options = {};
  }
  options = _.extend({
    draw: true
  }, DefaultStyle, options);
  colors = options.interval_class_colors;
  if (__indexOf.call(interval_classes, 0) < 0) {
    interval_classes = [0].concat(interval_classes);
  }
  cell_radius = options.radius;
  hex_radius = cell_radius / 2;
  cell_center = function(interval_klass) {
    var dx, dy, vectors, x, y;
    vectors = interval_class_vectors(interval_klass);
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
  for (_i = 0, _len = interval_classes.length; _i < _len; _i++) {
    interval_klass = interval_classes[_i];
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
  return with_graphics_context(function(ctx) {
    var a, color, i, is_root, label, pos, _fn, _j, _k, _l, _len1, _len2, _ref2, _ref3, _results;
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
    for (_j = 0, _len1 = interval_classes.length; _j < _len1; _j++) {
      interval_klass = interval_classes[_j];
      is_root = interval_klass === 0;
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
      if (is_root || (options.fill_cells && interval_klass < 12)) {
        ctx.fillStyle = color || 'rgba(255,0,0,0.15)';
        if (!is_root) {
          ctx.globalAlpha = 0.3;
        }
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      if (is_root || options.fill_cells) {
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
      for (_l = 0, _len2 = interval_classes.length; _l < _len2; _l++) {
        interval_klass = interval_classes[_l];
        label = IntervalNames[interval_klass];
        if (interval_klass === 0) {
          label = 'R';
        }
        _ref3 = cell_center(interval_klass), x = _ref3.x, y = _ref3.y;
        _results.push(draw_text(label, {
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

harmonic_table_block = function(tones, options) {
  var dimensions;
  dimensions = draw_harmonic_table(tones, _.extend({}, options, {
    compute_bounds: true,
    draw: false
  }));
  return block({
    width: dimensions.width,
    height: dimensions.height,
    draw: function() {
      return draw_harmonic_table(tones, options);
    }
  });
};

module.exports = {
  draw: draw_harmonic_table,
  block: harmonic_table_block
};


},{"./chord_diagram":"kgIvBT","./layout":"ThjNWR","./theory":"AmyBcu","underscore":24}],"ThjNWR":[function(require,module,exports){
var BuildDirectory, Canvas, Context, CurrentBook, CurrentPage, DefaultFilename, Mode, PaperSizes, TDLRLayout, above, box, directory, draw_text, erase_background, filename, fs, get_page_size_dimensions, hbox, labeled, measure_text, overlay, pad_box, path, save_canvas_to_png, text_box, util, vbox, with_book, with_canvas, with_graphics_context, with_grid, with_grid_boxes, with_page, write_pdf, _,
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

draw_text = function(text, options) {
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

with_canvas = function(canvas, cb) {
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

with_graphics_context = function(fn) {
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

pad_box = function(box, options) {
  var _ref;
  if (options.bottom) {
    box.height += options.bottom;
  }
  if (options.bottom) {
    box.descent = ((_ref = box.descent) != null ? _ref : 0) + options.bottom;
  }
  return box;
};

text_box = function(text, options) {
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
      return draw_text(text, options);
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
        return with_graphics_context(function(ctx) {
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
        with_graphics_context(function(ctx) {
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
        _results.push(with_graphics_context(function(ctx) {
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
  return above(text_box(text, options), box, options);
};

with_grid_boxes = function(options, generator) {
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
    start_row: function() {
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
  return with_grid(options, function(grid) {
    if (header) {
      with_graphics_context(function(ctx) {
        ctx.translate(0, header.height - header.descent);
        return header != null ? header.draw(ctx) : void 0;
      });
    }
    return cells.forEach(function(cell) {
      if (cell.linebreak != null) {
        grid.start_row();
      }
      if (cell === line_break) {
        return;
      }
      return grid.add_cell(function() {
        return with_graphics_context(function(ctx) {
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
      with_graphics_context(function(ctx) {
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

with_page = function(options, draw_page) {
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
    with_graphics_context(function(ctx) {
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

with_grid = function(options, cb) {
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
  with_page(options, function(page) {
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
          with_graphics_context(function(ctx) {
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
      start_row: function() {
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
    with_page(options, function(page) {
      var col, draw_fn, row, _j, _len1, _ref, _ref1, _results1;
      _ref = _.select(overflow, function(cell) {
        return cell.row < rows;
      });
      _results1 = [];
      for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
        _ref1 = _ref[_j], col = _ref1.col, row = _ref1.row, draw_fn = _ref1.draw_fn;
        _results1.push(with_graphics_context(function(ctx) {
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

with_book = function(filename, options, cb) {
  var book, canvas, ctx, height, page_count, page_limit, size, width, _ref, _ref1;
  if (CurrentBook) {
    throw new Error("with_book called recursively");
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
      with_page: function(options, draw_page) {
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
          with_page(options, draw_page);
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
  with_book: with_book,
  with_grid: with_grid,
  with_grid_boxes: with_grid_boxes,
  with_page: with_page,
  draw_text: draw_text,
  box: box,
  hbox: hbox,
  pad_box: pad_box,
  text_box: text_box,
  labeled: labeled,
  measure_text: measure_text,
  directory: directory,
  filename: filename,
  with_graphics_context: with_graphics_context,
  withCanvas: with_canvas
};


},{"canvas":"8QyYb9","fs":13,"path":18,"underscore":24,"util":21}],"wiIDa2":[function(require,module,exports){
var ChordDiagramStyle, PI, block, cos, draw_pitch_diagram, max, min, pitch_diagram_block, sin, with_graphics_context, _ref;

PI = Math.PI, cos = Math.cos, sin = Math.sin, min = Math.min, max = Math.max;

ChordDiagramStyle = require('./chord_diagram').defaultStyle;

_ref = require('./layout'), block = _ref.block, with_graphics_context = _ref.with_graphics_context;

draw_pitch_diagram = function(ctx, pitch_classes, options) {
  var angle, bounds, class_name, extend_bounds, m, pitch_class, pitch_class_angle, pitch_colors, pitch_names, r, r_label, x, y, _i, _j, _len, _len1;
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
  pitch_class_angle = function(pitch_class) {
    return (pitch_class - 3) * 2 * PI / 12;
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
  for (_i = 0, _len = pitch_classes.length; _i < _len; _i++) {
    pitch_class = pitch_classes[_i];
    angle = pitch_class_angle(pitch_class);
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
      ctx.fillStyle = pitch_colors[pitch_class] || 'black';
      ctx.fill();
    }
  }
  ctx.font = '4pt Times';
  ctx.fillStyle = 'black';
  for (pitch_class = _j = 0, _len1 = pitch_names.length; _j < _len1; pitch_class = ++_j) {
    class_name = pitch_names[pitch_class];
    angle = pitch_class_angle(pitch_class);
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

pitch_diagram_block = function(pitch_classes, scale) {
  var bounds;
  if (scale == null) {
    scale = 1;
  }
  bounds = with_graphics_context(function(ctx) {
    return draw_pitch_diagram(ctx, pitch_classes, {
      draw: false,
      measure: true
    });
  });
  return block({
    width: (bounds.right - bounds.left) * scale,
    height: (bounds.bottom - bounds.top) * scale,
    draw: function() {
      return with_graphics_context(function(ctx) {
        ctx.scale(scale, scale);
        ctx.translate(-bounds.left, -bounds.bottom);
        return draw_pitch_diagram(ctx, pitch_classes);
      });
    }
  });
};

module.exports = {
  draw: draw_pitch_diagram,
  block: pitch_diagram_block
};


},{"./chord_diagram":"kgIvBT","./layout":"ThjNWR"}],"AmyBcu":[function(require,module,exports){
var Chord, ChordDefinitions, Chords, FlatNoteNames, FunctionQualities, Functions, IntervalNames, LongIntervalNames, Modes, NoteNames, Scale, Scales, SharpNoteNames, interval_class_between, parseChordNumeral;

SharpNoteNames = 'C C# D D# E F F# G G# A A# B'.replace(/#/g, '\u266F').split(/\s/);

FlatNoteNames = 'C Db D Eb E F Gb G Ab A Bb B'.replace(/b/g, '\u266D').split(/\s/);

NoteNames = SharpNoteNames;

IntervalNames = ['P1', 'm2', 'M2', 'm3', 'M3', 'P4', 'TT', 'P5', 'm6', 'M6', 'm7', 'M7', 'P8'];

LongIntervalNames = ['Unison', 'Minor 2nd', 'Major 2nd', 'Minor 3rd', 'Major 3rd', 'Perfect 4th', 'Tritone', 'Perfect 5th', 'Minor 6th', 'Major 6th', 'Minor 7th', 'Major 7th', 'Octave'];

interval_class_between = function(pca, pcb) {
  var n;
  n = (pcb - pca) % 12;
  while (n < 0) {
    n += 12;
  }
  return n;
};

Scale = (function() {
  function Scale(_arg) {
    this.name = _arg.name, this.pitches = _arg.pitches, this.tonicName = _arg.tonicName;
  }

  Scale.prototype.chords = function() {
    var i, pitches, tonicPitch, _i, _ref, _results;
    tonicPitch = NoteNames.indexOf(this.tonicName);
    _results = [];
    for (i = _i = 0, _ref = this.pitches.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
      pitches = this.pitches.slice(i).concat(this.pitches.slice(0, i));
      pitches = [pitches[0], pitches[2], pitches[4]].map(function(n) {
        return (n + tonicPitch) % 12;
      });
      _results.push(Chord.fromPitches(pitches));
    }
    return _results;
  };

  Scale.prototype.at = function(tonicName) {
    return new Scale({
      name: this.name,
      pitches: this.pitches,
      tonicName: tonicName
    });
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
  var d, delta, i, mode_names, name, pitches, root_tones, _i, _len, _results;
  root_tones = Scales['Diatonic Major'].pitches;
  mode_names = 'Ionian Dorian Phrygian Lydian Mixolydian Aeolian Locrian'.split(/\s/);
  _results = [];
  for (i = _i = 0, _len = root_tones.length; _i < _len; i = ++_i) {
    delta = root_tones[i];
    name = mode_names[i];
    pitches = (function() {
      var _j, _len1, _ref, _results1;
      _ref = root_tones.slice(i).concat(root_tones.slice(0, i));
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
  function Chord(options) {
    var degree, degrees, i, name, pc, pci;
    this.name = options.name;
    this.full_name = options.full_name;
    this.abbrs = options.abbrs || [options.abbr];
    if (typeof this.abbrs === 'string') {
      this.abbrs = this.abbrs.split(/s/);
    }
    this.abbr = options.abbr || this.abbrs[0];
    this.pitch_classes = options.pitch_classes;
    this.root = options.root;
    if (typeof this.root === 'string') {
      this.root = NoteNames.indexOf(this.root);
    }
    degrees = (function() {
      var _i, _ref, _results;
      _results = [];
      for (i = _i = 0, _ref = this.pitch_classes.length; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
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
      _ref = this.pitch_classes;
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
    if (typeof this.root === 'number') {
      Object.defineProperty(this, 'name', {
        get: function() {
          return "" + NoteNames[this.root] + this.abbr;
        }
      });
    }
  }

  Chord.prototype.at = function(root) {
    return new Chord({
      name: this.name,
      full_name: this.full_name,
      abbrs: this.abbrs,
      pitch_classes: this.pitch_classes,
      root: root
    });
  };

  Chord.prototype.degree_name = function(degree_index) {
    return this.components[degree_index];
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
    })()).sort();
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
    pitch_classes: '047'
  }, {
    name: 'Minor',
    abbr: 'm',
    pitch_classes: '037'
  }, {
    name: 'Augmented',
    abbrs: ['+', 'aug'],
    pitch_classes: '048'
  }, {
    name: 'Diminished',
    abbrs: ['°', 'dim'],
    pitch_classes: '036'
  }, {
    name: 'Sus2',
    abbr: 'sus2',
    pitch_classes: '027'
  }, {
    name: 'Sus4',
    abbr: 'sus4',
    pitch_classes: '057'
  }, {
    name: 'Dominant 7th',
    abbrs: ['7', 'dom7'],
    pitch_classes: '047t'
  }, {
    name: 'Augmented 7th',
    abbrs: ['+7', '7aug'],
    pitch_classes: '048t'
  }, {
    name: 'Diminished 7th',
    abbrs: ['°7', 'dim7'],
    pitch_classes: '0369'
  }, {
    name: 'Major 7th',
    abbr: 'maj7',
    pitch_classes: '047e'
  }, {
    name: 'Minor 7th',
    abbr: 'min7',
    pitch_classes: '037t'
  }, {
    name: 'Dominant 7b5',
    abbr: '7b5',
    pitch_classes: '046t'
  }, {
    name: 'Minor 7th b5',
    abbrs: ['ø', 'Ø', 'm7b5'],
    pitch_classes: '036t'
  }, {
    name: 'Diminished Maj 7th',
    abbr: '°Maj7',
    pitch_classes: '036e'
  }, {
    name: 'Minor-Major 7th',
    abbrs: ['min/maj7', 'min(maj7)'],
    pitch_classes: '037e'
  }, {
    name: '6th',
    abbrs: ['6', 'M6', 'M6', 'maj6'],
    pitch_classes: '0479'
  }, {
    name: 'Minor 6th',
    abbrs: ['m6', 'min6'],
    pitch_classes: '0379'
  }
];

Chords = ChordDefinitions.map(function(spec) {
  spec.full_name = spec.name;
  spec.name = spec.name.replace(/Major(?!$)/, 'Maj').replace(/Minor(?!$)/, 'Min').replace('Dominant', 'Dom').replace('Diminished', 'Dim');
  spec.abbrs || (spec.abbrs = [spec.abbr]);
  if (typeof spec.abbrs === 'string') {
    spec.abbrs = spec.abbrs.split(/s/);
  }
  spec.abbr || (spec.abbr = spec.abbrs[0]);
  spec.pitch_classes = spec.pitch_classes.match(/./g).map(function(c) {
    return {
      't': 10,
      'e': 11
    }[c] || Number(c);
  });
  return new Chord(spec);
});

(function() {
  var abbrs, chord, full_name, key, name, _i, _j, _len, _len1, _ref, _results;
  _results = [];
  for (_i = 0, _len = Chords.length; _i < _len; _i++) {
    chord = Chords[_i];
    name = chord.name, full_name = chord.full_name, abbrs = chord.abbrs;
    _ref = [name, full_name].concat(abbrs);
    for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
      key = _ref[_j];
      Chords[key] = chord;
    }
    _results.push(Chords[chord.pitch_classes] = chord);
  }
  return _results;
})();

module.exports = {
  Chords: Chords,
  IntervalNames: IntervalNames,
  LongIntervalNames: LongIntervalNames,
  Modes: Modes,
  NoteNames: NoteNames,
  Scale: Scale,
  Scales: Scales,
  interval_class_between: interval_class_between
};


},{}],"VD5hCQ":[function(require,module,exports){
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
module.exports=require('L0flg7');
},{}],"./theory":[function(require,module,exports){
module.exports=require('AmyBcu');
},{}],"./fretboard_model":[function(require,module,exports){
module.exports=require('dVmYil');
},{}],"canvas":[function(require,module,exports){
module.exports=require('8QyYb9');
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

},{"__browserify_process":23}],"./layout":[function(require,module,exports){
module.exports=require('ThjNWR');
},{}],"./fretboard_diagram":[function(require,module,exports){
module.exports=require('JjUvl1');
},{}],21:[function(require,module,exports){
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

},{"events":12}],"./chord_diagram":[function(require,module,exports){
module.exports=require('kgIvBT');
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

},{}],"./pitch_diagram":[function(require,module,exports){
module.exports=require('wiIDa2');
},{}],"./fretboard_logic":[function(require,module,exports){
module.exports=require('YoMTGX');
},{}],"./utils":[function(require,module,exports){
module.exports=require('VD5hCQ');
},{}]},{},[1,"8QyYb9","kgIvBT","JjUvl1","YoMTGX","dVmYil","L0flg7","ThjNWR","wiIDa2","AmyBcu","VD5hCQ"])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvb3N0ZWVsZS9Db2RlL2ZyZXRib2FyZC1sb2dpYy9hcHAvanMvYXBwLmNvZmZlZSIsIi9Vc2Vycy9vc3RlZWxlL0NvZGUvZnJldGJvYXJkLWxvZ2ljL2xpYi9icm93c2VyL2NhbnZhcy5jb2ZmZWUiLCIvVXNlcnMvb3N0ZWVsZS9Db2RlL2ZyZXRib2FyZC1sb2dpYy9saWIvY2hvcmRfZGlhZ3JhbS5jb2ZmZWUiLCIvVXNlcnMvb3N0ZWVsZS9Db2RlL2ZyZXRib2FyZC1sb2dpYy9saWIvZnJldGJvYXJkX2RpYWdyYW0uY29mZmVlIiwiL1VzZXJzL29zdGVlbGUvQ29kZS9mcmV0Ym9hcmQtbG9naWMvbGliL2ZyZXRib2FyZF9sb2dpYy5jb2ZmZWUiLCIvVXNlcnMvb3N0ZWVsZS9Db2RlL2ZyZXRib2FyZC1sb2dpYy9saWIvZnJldGJvYXJkX21vZGVsLmNvZmZlZSIsIi9Vc2Vycy9vc3RlZWxlL0NvZGUvZnJldGJvYXJkLWxvZ2ljL2xpYi9oYXJtb25pY190YWJsZS5jb2ZmZWUiLCIvVXNlcnMvb3N0ZWVsZS9Db2RlL2ZyZXRib2FyZC1sb2dpYy9saWIvbGF5b3V0LmNvZmZlZSIsIi9Vc2Vycy9vc3RlZWxlL0NvZGUvZnJldGJvYXJkLWxvZ2ljL2xpYi9waXRjaF9kaWFncmFtLmNvZmZlZSIsIi9Vc2Vycy9vc3RlZWxlL0NvZGUvZnJldGJvYXJkLWxvZ2ljL2xpYi90aGVvcnkuY29mZmVlIiwiL1VzZXJzL29zdGVlbGUvQ29kZS9mcmV0Ym9hcmQtbG9naWMvbGliL3V0aWxzLmNvZmZlZSIsIi9Vc2Vycy9vc3RlZWxlL0NvZGUvZnJldGJvYXJkLWxvZ2ljL25vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLWJ1aWx0aW5zL2J1aWx0aW4vZXZlbnRzLmpzIiwiL1VzZXJzL29zdGVlbGUvQ29kZS9mcmV0Ym9hcmQtbG9naWMvbm9kZV9tb2R1bGVzL2dydW50LWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItYnVpbHRpbnMvYnVpbHRpbi9mcy5qcyIsIi9Vc2Vycy9vc3RlZWxlL0NvZGUvZnJldGJvYXJkLWxvZ2ljL25vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLWJ1aWx0aW5zL2J1aWx0aW4vcGF0aC5qcyIsIi9Vc2Vycy9vc3RlZWxlL0NvZGUvZnJldGJvYXJkLWxvZ2ljL25vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLWJ1aWx0aW5zL2J1aWx0aW4vdXRpbC5qcyIsIi9Vc2Vycy9vc3RlZWxlL0NvZGUvZnJldGJvYXJkLWxvZ2ljL25vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9pbnNlcnQtbW9kdWxlLWdsb2JhbHMvbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsIi9Vc2Vycy9vc3RlZWxlL0NvZGUvZnJldGJvYXJkLWxvZ2ljL25vZGVfbW9kdWxlcy91bmRlcnNjb3JlL3VuZGVyc2NvcmUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLElBQUEsd0hBQUE7O0FBQUEsQ0FBQSxFQUFlLElBQUEsS0FBZixLQUFlOztBQUNmLENBREEsRUFDUyxHQUFULENBQVMsR0FBQTs7QUFFVCxDQUhBLENBSUUsS0FHRSxPQUpKLElBQUEsQ0FJSSxNQVBKOztBQVNBLENBVEEsQ0FVRSxHQURGLENBQUEsQ0FJSSxDQUFBLEVBQUE7O0FBSUosQ0FqQkEsRUFpQmdDLEVBQWhDLEVBQU8sQ0FBUCxDQUFnQztDQUN0QixDQUFvQixLQUFyQixDQUFQLENBQUEsS0FBNEI7Q0FERTs7QUFHaEMsQ0FwQkEsQ0FvQnFDLENBQXJDLEdB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TCxFQUFBLEdBQUE7Q0FGTzs7QUFJVixDQTNCQSxFQTJCVSxJQUFWLEVBQVc7Q0FBZ0IsRUFBQSxJQUFSLEVBQUE7Q0FBVDs7QUFFVixDQTdCQSxFQTZCaUIsR0FBWCxDQUFOO0NBQWlCLENBQ2YsS0FEZTtDQUFBLENBRWYsS0FGZTtDQUFBLENBR2YsS0FIZTtDQTdCakIsQ0FBQTs7OztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsTUE7QUFDQTs7Ozs7Ozs7OztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7QUNqTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUN6VkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiQ2hvcmREaWFncmFtID0gcmVxdWlyZSAnLi9jaG9yZF9kaWFncmFtJ1xuTGF5b3V0ID0gcmVxdWlyZSAnLi9sYXlvdXQnXG5cbntcbiAgYmVzdF9maW5nZXJpbmdfZm9yXG4gIGZpbmdlcmluZ3NfZm9yXG4gIGZpbmdlcl9wb3NpdGlvbnNfb25fY2hvcmRcbn0gPSByZXF1aXJlKCcuL2ZyZXRib2FyZF9sb2dpYycpXG5cbntcbiAgQ2hvcmRzXG4gIFNjYWxlXG4gIFNjYWxlc1xufSA9IHJlcXVpcmUoJy4vdGhlb3J5JylcblxuXG4jIHJlcXVpcmVqcyBuZWNlc3NpdGF0ZXMgdGhpc1xuYW5ndWxhci5lbGVtZW50KGRvY3VtZW50KS5yZWFkeSAtPlxuICBhbmd1bGFyLmJvb3RzdHJhcChkb2N1bWVudCwgWydGcmV0Ym9hcmRBcHAnXSlcblxuYXBwID0gYW5ndWxhci5tb2R1bGUgJ0ZyZXRib2FyZEFwcCcsIFtdXG5cbmFwcC5jb250cm9sbGVyICdDaG9yZEN0cmwnLCAoJHNjb3BlKSAtPlxuICAkc2NvcGUuZ2V0U2NhbGVDaG9yZHMgPSAoc2NhbGVOYW1lKSAtPlxuICAgIFNjYWxlLmZpbmQoc2NhbGVOYW1lKS5jaG9yZHMoKS5tYXAgKGNob3JkKSAtPiBjaG9yZC5uYW1lXG5cbmFwcC5kaXJlY3RpdmUgJ2Nob3JkJywgLT5cbiAgcmVzdHJpY3Q6ICdDRSdcbiAgcmVwbGFjZTogdHJ1ZVxuICB0ZW1wbGF0ZTogJzxjYW52YXMgd2lkdGg9XCI5MFwiIGhlaWdodD1cIjEwMFwiLz4nXG4gIHRyYW5zY2x1ZGU6IHRydWVcbiAgc2NvcGU6IHtuYW1lOiAnQCd9XG4gIGxpbms6IChzY29wZSwgZWxlbWVudCwgYXR0cnMpIC0+XG4gICAgY2FudmFzID0gZWxlbWVudFswXVxuICAgIGF0dHJzLiRvYnNlcnZlICduYW1lJywgKGNob3JkTmFtZSkgLT5cbiAgICAgIGNob3JkID0gQ2hvcmRzLk1ham9yLmF0KGNob3JkTmFtZSlcbiAgICAgIGZpbmdlcmluZ3MgPSBmaW5nZXJpbmdzX2ZvciBjaG9yZFxuICAgICAgZmluZ2VyaW5nID0gZmluZ2VyaW5nc1swXVxuICAgICAgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJylcbiAgICAgIENob3JkRGlhZ3JhbS5kcmF3IGN0eCwgZmluZ2VyaW5nLnBvc2l0aW9ucywgYmFycmVzOiBmaW5nZXJpbmcuYmFycmVzXG4iLCJcbiIsIl8gPSByZXF1aXJlICd1bmRlcnNjb3JlJ1xuXG57XG4gIEZyZXRDb3VudFxuICBGcmV0TnVtYmVyc1xuICBTdHJpbmdDb3VudFxuICBTdHJpbmdOdW1iZXJzXG59ID0gcmVxdWlyZSAnLi9mcmV0Ym9hcmRfbW9kZWwnXG5MYXlvdXQgPSByZXF1aXJlICcuL2xheW91dCdcblxuXG4jXG4jIFN0eWxlXG4jXG5cbntoc3YyY3NzfSA9IHJlcXVpcmUgJy4vdXRpbHMnXG5cblNtYWxsU3R5bGUgPVxuICBoX2d1dHRlcjogNVxuICB2X2d1dHRlcjogNVxuICBzdHJpbmdfc3BhY2luZzogNlxuICBmcmV0X2hlaWdodDogOFxuICBhYm92ZV9mcmV0Ym9hcmQ6IDhcbiAgbm90ZV9yYWRpdXM6IDFcbiAgY2xvc2VkX3N0cmluZ19mb250c2l6ZTogNFxuICBjaG9yZF9kZWdyZWVfY29sb3JzOiBbJ3JlZCcsICdibHVlJywgJ2dyZWVuJywgJ29yYW5nZSddXG4gIGludGVydmFsX2NsYXNzX2NvbG9yczogWzAuLi4xMl0ubWFwIChuKSAtPlxuICAgICMgaSA9ICg3ICogbikgJSAxMiAgIyBjb2xvciBieSBjaXJjbGUgb2YgZmlmdGggYXNjZW5zaW9uXG4gICAgaHN2MmNzcyBoOiBuICogMzYwIC8gMTIsIHM6IDEsIHY6IDFcblxuRGVmYXVsdFN0eWxlID0gXy5leHRlbmQge30sIFNtYWxsU3R5bGUsXG4gIHN0cmluZ19zcGFjaW5nOiAxMlxuICBmcmV0X2hlaWdodDogMTZcbiAgbm90ZV9yYWRpdXM6IDNcbiAgY2xvc2VkX3N0cmluZ19mb250c2l6ZTogOFxuXG5jb21wdXRlX2RpbWVuc2lvbnMgPSAoc3R5bGU9RGVmYXVsdFN0eWxlKSAtPlxuICB7XG4gICAgd2lkdGg6IDIgKiBzdHlsZS5oX2d1dHRlciArIChTdHJpbmdDb3VudCAtIDEpICogc3R5bGUuc3RyaW5nX3NwYWNpbmdcbiAgICBoZWlnaHQ6IDIgKiBzdHlsZS52X2d1dHRlciArIChzdHlsZS5mcmV0X2hlaWdodCArIDIpICogRnJldENvdW50XG4gIH1cblxuXG4jXG4jIERyYXdpbmcgTWV0aG9kc1xuI1xuXG5kcmF3X2Nob3JkX2RpYWdyYW1fc3RyaW5ncyA9IChjdHgsIG9wdGlvbnM9e30pIC0+XG4gIHN0eWxlID0gRGVmYXVsdFN0eWxlXG4gIGZvciBzdHJpbmcgaW4gU3RyaW5nTnVtYmVyc1xuICAgIHggPSBzdHJpbmcgKiBzdHlsZS5zdHJpbmdfc3BhY2luZyArIHN0eWxlLmhfZ3V0dGVyXG4gICAgY3R4LmJlZ2luUGF0aCgpXG4gICAgY3R4Lm1vdmVUbyB4LCBzdHlsZS52X2d1dHRlciArIHN0eWxlLmFib3ZlX2ZyZXRib2FyZFxuICAgIGN0eC5saW5lVG8geCwgc3R5bGUudl9ndXR0ZXIgKyBzdHlsZS5hYm92ZV9mcmV0Ym9hcmQgKyBGcmV0Q291bnQgKiBzdHlsZS5mcmV0X2hlaWdodFxuICAgIGN0eC5zdHJva2VTdHlsZSA9IChpZiBvcHRpb25zLmRpbV9zdHJpbmdzIGFuZCBzdHJpbmcgaW4gb3B0aW9ucy5kaW1fc3RyaW5ncyB0aGVuICdyZ2JhKDAsMCwwLDAuMiknIGVsc2UgJ2JsYWNrJylcbiAgICBjdHguc3Ryb2tlKClcblxuZHJhd19jaG9yZF9kaWFncmFtX2ZyZXRzID0gKGN0eCwge251dH09e251dDogdHJ1ZX0pIC0+XG4gIHN0eWxlID0gRGVmYXVsdFN0eWxlXG4gIGN0eC5zdHJva2VTdHlsZSA9ICdibGFjaydcbiAgZm9yIGZyZXQgaW4gRnJldE51bWJlcnNcbiAgICB5ID0gc3R5bGUudl9ndXR0ZXIgKyBzdHlsZS5hYm92ZV9mcmV0Ym9hcmQgKyBmcmV0ICogc3R5bGUuZnJldF9oZWlnaHRcbiAgICBjdHguYmVnaW5QYXRoKClcbiAgICBjdHgubW92ZVRvIHN0eWxlLnZfZ3V0dGVyIC0gMC41LCB5XG4gICAgY3R4LmxpbmVUbyBzdHlsZS52X2d1dHRlciArIDAuNSArIChTdHJpbmdDb3VudCAtIDEpICogc3R5bGUuc3RyaW5nX3NwYWNpbmcsIHlcbiAgICBjdHgubGluZVdpZHRoID0gMyBpZiBmcmV0ID09IDAgYW5kIG51dFxuICAgIGN0eC5zdHJva2UoKVxuICAgIGN0eC5saW5lV2lkdGggPSAxXG5cbmRyYXdfY2hvcmRfZGlhZ3JhbSA9IChjdHgsIHBvc2l0aW9ucywgb3B0aW9ucz17fSkgLT5cbiAgZGVmYXVsdHMgPSB7ZHJhd19jbG9zZWRfc3RyaW5nczogdHJ1ZSwgbnV0OiB0cnVlLCBkeTogMCwgc3R5bGU6IERlZmF1bHRTdHlsZX1cbiAgb3B0aW9ucyA9IF8uZXh0ZW5kIGRlZmF1bHRzLCBvcHRpb25zXG4gIHtiYXJyZXMsIGR5LCBkcmF3X2Nsb3NlZF9zdHJpbmdzLCBzdHlsZX0gPSBvcHRpb25zXG4gIGlmIG9wdGlvbnMuZGltX3VudXNlZF9zdHJpbmdzXG4gICAgdXNlZF9zdHJpbmdzID0gKHN0cmluZyBmb3Ige3N0cmluZ30gaW4gcG9zaXRpb25zKVxuICAgIG9wdGlvbnMuZGltX3N0cmluZ3MgPSAoc3RyaW5nIGZvciBzdHJpbmcgaW4gU3RyaW5nTnVtYmVycyB3aGVuIHN0cmluZyBub3QgaW4gdXNlZF9zdHJpbmdzKVxuXG4gIGZpbmdlcl9jb29yZGluYXRlcyA9ICh7c3RyaW5nLCBmcmV0fSkgLT5cbiAgICByZXR1cm4ge1xuICAgICAgeDogc3R5bGUuaF9ndXR0ZXIgKyBzdHJpbmcgKiBzdHlsZS5zdHJpbmdfc3BhY2luZyxcbiAgICAgIHk6IHN0eWxlLnZfZ3V0dGVyICsgc3R5bGUuYWJvdmVfZnJldGJvYXJkICsgKGZyZXQgLSAwLjUpICogc3R5bGUuZnJldF9oZWlnaHQgKyBkeVxuICAgIH1cblxuICBkcmF3X2Zpbmdlcl9wb3NpdGlvbiA9IChwb3NpdGlvbiwgb3B0aW9ucz17fSkgLT5cbiAgICB7aXNfcm9vdCwgY29sb3J9ID0gb3B0aW9uc1xuICAgIHt4LCB5fSA9IGZpbmdlcl9jb29yZGluYXRlcyBwb3NpdGlvblxuICAgIGN0eC5maWxsU3R5bGUgPSBjb2xvciBvciAoaWYgaXNfcm9vdCB0aGVuICdyZWQnIGVsc2UgJ3doaXRlJylcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSBjb2xvciBvciAoaWYgaXNfcm9vdCB0aGVuICdyZWQnIGVsc2UgJ2JsYWNrJylcbiAgICBjdHgubGluZVdpZHRoID0gMVxuICAgIGN0eC5iZWdpblBhdGgoKVxuICAgIGlmIGlzX3Jvb3QgYW5kIHBvc2l0aW9uLmZyZXRcbiAgICAgIGRvIChyPXN0eWxlLm5vdGVfcmFkaXVzKSAtPlxuICAgICAgICBjdHgucmVjdCB4IC0gciwgeSAtIHIsIDIgKiByLCAyICogclxuICAgIGVsc2VcbiAgICAgIGN0eC5hcmMgeCwgeSwgc3R5bGUubm90ZV9yYWRpdXMsIDAsIE1hdGguUEkgKiAyLCBmYWxzZVxuICAgIGN0eC5maWxsKCkgaWYgcG9zaXRpb24uZnJldCA+IDAgb3IgaXNfcm9vdFxuICAgIGN0eC5zdHJva2UoKVxuXG4gIGRyYXdfYmFycmVzID0gLT5cbiAgICBjdHguZmlsbFN0eWxlID0gJ2JsYWNrJ1xuICAgIGZvciB7ZnJldCwgc3RyaW5nLCBmcmV0LCBzdHJpbmdfY291bnR9IGluIGJhcnJlc1xuICAgICAge3g6IHgxLCB5fSA9IGZpbmdlcl9jb29yZGluYXRlcyB7c3RyaW5nLCBmcmV0fVxuICAgICAge3g6IHgyfSA9IGZpbmdlcl9jb29yZGluYXRlcyB7c3RyaW5nOiBzdHJpbmcgKyBzdHJpbmdfY291bnQgLSAxLCBmcmV0fVxuICAgICAgdyA9IHgyIC0geDFcbiAgICAgIGN0eC5zYXZlKClcbiAgICAgIGN0eC50cmFuc2xhdGUgKHgxICsgeDIpIC8gMiwgeSAtIHN0eWxlLmZyZXRfaGVpZ2h0ICogLjI1XG4gICAgICBjdHguYmVnaW5QYXRoKClcbiAgICAgIGVjY2VudHJpY2l0eSA9IDEwXG4gICAgICBkbyAtPlxuICAgICAgICBjdHguc2F2ZSgpXG4gICAgICAgIGN0eC5zY2FsZSB3LCBlY2NlbnRyaWNpdHlcbiAgICAgICAgY3R4LmFyYyAwLCAwLCBzdHlsZS5zdHJpbmdfc3BhY2luZyAvIDIgLyBlY2NlbnRyaWNpdHksIE1hdGguUEksIDAsIGZhbHNlXG4gICAgICAgIGN0eC5yZXN0b3JlKClcbiAgICAgIGRvIC0+XG4gICAgICAgIGN0eC5zYXZlKClcbiAgICAgICAgY3R4LnNjYWxlIHcsIDE0XG4gICAgICAgIGN0eC5hcmMgMCwgMCwgc3R5bGUuc3RyaW5nX3NwYWNpbmcgLyAyIC8gZWNjZW50cmljaXR5LCAwLCBNYXRoLlBJLCB0cnVlXG4gICAgICAgIGN0eC5yZXN0b3JlKClcbiAgICAgIGN0eC5maWxsKClcbiAgICAgIGN0eC5yZXN0b3JlKClcbiAgICAgICMgY3R4LmZpbGxTdHlsZSA9ICdyZ2JhKDAsMCwwLCAwLjUpJ1xuICAgICAgIyBjdHguYmVnaW5QYXRoKClcbiAgICAgICMgY3R4LmFyYyB4MSwgeSwgc3R5bGUuc3RyaW5nX3NwYWNpbmcgLyAyLCBNYXRoLlBJICogMS8yLCBNYXRoLlBJICogMy8yLCBmYWxzZVxuICAgICAgIyBjdHguYXJjIHgyLCB5LCBzdHlsZS5zdHJpbmdfc3BhY2luZyAvIDIsIE1hdGguUEkgKiAzLzIsIE1hdGguUEkgKiAxLzIsIGZhbHNlXG4gICAgICAjIGN0eC5maWxsKClcblxuICBkcmF3X2Zpbmdlcl9wb3NpdGlvbnMgPSAtPlxuICAgIGZvciBwb3NpdGlvbiBpbiBwb3NpdGlvbnNcbiAgICAgIGRlZmF1bHRfb3B0aW9ucyA9XG4gICAgICAgIGNvbG9yOiBzdHlsZS5pbnRlcnZhbF9jbGFzc19jb2xvcnNbcG9zaXRpb24uaW50ZXJ2YWxfY2xhc3NdXG4gICAgICAgIGlzX3Jvb3Q6IChwb3NpdGlvbi5pbnRlcnZhbF9jbGFzcyA9PSAwKVxuICAgICAgZHJhd19maW5nZXJfcG9zaXRpb24gcG9zaXRpb24sIF8uZXh0ZW5kKGRlZmF1bHRfb3B0aW9ucywgcG9zaXRpb24pXG5cbiAgZHJhd19jbG9zZWRfc3RyaW5ncyA9IC0+XG4gICAgZnJldHRlZF9zdHJpbmdzID0gW11cbiAgICBmcmV0dGVkX3N0cmluZ3NbcG9zaXRpb24uc3RyaW5nXSA9IHRydWUgZm9yIHBvc2l0aW9uIGluIHBvc2l0aW9uc1xuICAgIGNsb3NlZF9zdHJpbmdzID0gKHN0cmluZyBmb3Igc3RyaW5nIGluIFN0cmluZ051bWJlcnMgd2hlbiBub3QgZnJldHRlZF9zdHJpbmdzW3N0cmluZ10pXG4gICAgciA9IHN0eWxlLm5vdGVfcmFkaXVzXG4gICAgY3R4LmZpbGxTdHlsZSA9ICdibGFjaydcbiAgICBmb3Igc3RyaW5nIGluIGNsb3NlZF9zdHJpbmdzXG4gICAgICB7eCwgeX0gPSBmaW5nZXJfY29vcmRpbmF0ZXMge3N0cmluZywgZnJldDogMH1cbiAgICAgIGN0eC5zdHJva2VTdHlsZSA9ICdibGFjaydcbiAgICAgIGN0eC5iZWdpblBhdGgoKVxuICAgICAgY3R4Lm1vdmVUbyB4IC0gciwgeSAtIHJcbiAgICAgIGN0eC5saW5lVG8geCArIHIsIHkgKyByXG4gICAgICBjdHgubW92ZVRvIHggLSByLCB5ICsgclxuICAgICAgY3R4LmxpbmVUbyB4ICsgciwgeSAtIHJcbiAgICAgIGN0eC5zdHJva2UoKVxuXG4gIGRyYXdfY2hvcmRfZGlhZ3JhbV9zdHJpbmdzIGN0eCwgb3B0aW9uc1xuICBkcmF3X2Nob3JkX2RpYWdyYW1fZnJldHMgY3R4LCBudXQ6IG9wdGlvbnMubnV0XG4gIGRyYXdfYmFycmVzKCkgaWYgYmFycmVzXG4gIGRyYXdfZmluZ2VyX3Bvc2l0aW9ucygpIGlmIHBvc2l0aW9uc1xuICBkcmF3X2Nsb3NlZF9zdHJpbmdzKCkgaWYgcG9zaXRpb25zIGFuZCBvcHRpb25zLmRyYXdfY2xvc2VkX3N0cmluZ3NcblxuZHJhd19jaG9yZF9ibG9jayA9IChwb3NpdGlvbnMsIG9wdGlvbnMpIC0+XG4gIGRpbWVuc2lvbnMgPSBjb21wdXRlX2RpbWVuc2lvbnMoKVxuICBMYXlvdXQuYmxvY2tcbiAgICB3aWR0aDogZGltZW5zaW9ucy53aWR0aFxuICAgIGhlaWdodDogZGltZW5zaW9ucy5oZWlnaHRcbiAgICBkcmF3OiAoKSAtPlxuICAgICAgTGF5b3V0LndpdGhfZ3JhcGhpY3NfY29udGV4dCAoY3R4KSAtPlxuICAgICAgICBjdHgudHJhbnNsYXRlIDAsIC1kaW1lbnNpb25zLmhlaWdodFxuICAgICAgICBkcmF3X2Nob3JkX2RpYWdyYW0gY3R4LCBwb3NpdGlvbnMsIG9wdGlvbnNcblxubW9kdWxlLmV4cG9ydHMgPVxuICBkZWZhdWx0U3R5bGU6IERlZmF1bHRTdHlsZVxuICB3aWR0aDogY29tcHV0ZV9kaW1lbnNpb25zKCkud2lkdGhcbiAgaGVpZ2h0OiBjb21wdXRlX2RpbWVuc2lvbnMoKS5oZWlnaHRcbiAgZHJhdzogZHJhd19jaG9yZF9kaWFncmFtXG4gIGJsb2NrOiBkcmF3X2Nob3JkX2Jsb2NrXG4iLCJ7XG4gIEZyZXRDb3VudFxuICBGcmV0TnVtYmVyc1xuICBTdHJpbmdDb3VudFxuICBTdHJpbmdOdW1iZXJzXG59ID0gcmVxdWlyZSAnLi9mcmV0Ym9hcmRfbW9kZWwnXG5cblxuI1xuIyBTdHlsZVxuI1xuXG5EZWZhdWx0U3R5bGUgPVxuICBoX2d1dHRlcjogMTBcbiAgdl9ndXR0ZXI6IDEwXG4gIHN0cmluZ19zcGFjaW5nOiAyMFxuICBmcmV0X3dpZHRoOiA0NVxuICBmcmV0X292ZXJoYW5nOiAuMyAqIDQ1XG5cbnBhZGRlZF9mcmV0Ym9hcmRfd2lkdGggPSBkbyAoc3R5bGU9RGVmYXVsdFN0eWxlKSAtPlxuICAyICogc3R5bGUudl9ndXR0ZXIgKyBzdHlsZS5mcmV0X3dpZHRoICogRnJldENvdW50ICsgc3R5bGUuZnJldF9vdmVyaGFuZ1xuXG5wYWRkZWRfZnJldGJvYXJkX2hlaWdodCA9IGRvIChzdHlsZT1EZWZhdWx0U3R5bGUpIC0+XG4gIDIgKiBzdHlsZS5oX2d1dHRlciArIChTdHJpbmdDb3VudCAtIDEpICogc3R5bGUuc3RyaW5nX3NwYWNpbmdcblxuXG4jXG4jIERyYXdpbmcgTWV0aG9kc1xuI1xuXG5kcmF3X2ZyZXRib2FyZF9zdHJpbmdzID0gKGN0eCkgLT5cbiAgc3R5bGUgPSBEZWZhdWx0U3R5bGVcbiAgZm9yIHN0cmluZyBpbiBTdHJpbmdOdW1iZXJzXG4gICAgeSA9IHN0cmluZyAqIHN0eWxlLnN0cmluZ19zcGFjaW5nICsgc3R5bGUuaF9ndXR0ZXJcbiAgICBjdHguYmVnaW5QYXRoKClcbiAgICBjdHgubW92ZVRvIHN0eWxlLmhfZ3V0dGVyLCB5XG4gICAgY3R4LmxpbmVUbyBzdHlsZS5oX2d1dHRlciArIEZyZXRDb3VudCAqIHN0eWxlLmZyZXRfd2lkdGggKyBzdHlsZS5mcmV0X292ZXJoYW5nLCB5XG4gICAgY3R4LmxpbmVXaWR0aCA9IDFcbiAgICBjdHguc3Ryb2tlKClcblxuZHJhd19mcmV0Ym9hcmRfZnJldHMgPSAoY3R4KSAtPlxuICBzdHlsZSA9IERlZmF1bHRTdHlsZVxuICBmb3IgZnJldCBpbiBGcmV0TnVtYmVyc1xuICAgIHggPSBzdHlsZS5oX2d1dHRlciArIGZyZXQgKiBzdHlsZS5mcmV0X3dpZHRoXG4gICAgY3R4LmJlZ2luUGF0aCgpXG4gICAgY3R4Lm1vdmVUbyB4LCBzdHlsZS5oX2d1dHRlclxuICAgIGN0eC5saW5lVG8geCwgc3R5bGUuaF9ndXR0ZXIgKyAoU3RyaW5nQ291bnQgLSAxKSAqIHN0eWxlLnN0cmluZ19zcGFjaW5nXG4gICAgY3R4LmxpbmVXaWR0aCA9IDMgaWYgZnJldCA9PSAwXG4gICAgY3R4LnN0cm9rZSgpXG4gICAgY3R4LmxpbmVXaWR0aCA9IDFcblxuZHJhd19mcmV0Ym9hcmRfZmluZ2VyX3Bvc2l0aW9uID0gKGN0eCwgcG9zaXRpb24sIG9wdGlvbnM9e30pIC0+XG4gIHtzdHJpbmcsIGZyZXR9ID0gcG9zaXRpb25cbiAge2lzX3Jvb3QsIGNvbG9yfSA9IG9wdGlvbnNcbiAgc3R5bGUgPSBEZWZhdWx0U3R5bGVcbiAgY29sb3IgfHw9IGlmIGlzX3Jvb3QgdGhlbiAncmVkJyBlbHNlICd3aGl0ZSdcbiAgeCA9IHN0eWxlLmhfZ3V0dGVyICsgKGZyZXQgLSAwLjUpICogc3R5bGUuZnJldF93aWR0aFxuICB4ID0gc3R5bGUuaF9ndXR0ZXIgaWYgZnJldCA9PSAwXG4gIHkgPSBzdHlsZS52X2d1dHRlciArICg1IC0gc3RyaW5nKSAqIHN0eWxlLnN0cmluZ19zcGFjaW5nXG4gIGN0eC5iZWdpblBhdGgoKVxuICBjdHguYXJjIHgsIHksIDcsIDAsIDIgKiBNYXRoLlBJLCBmYWxzZVxuICBjdHguZmlsbFN0eWxlID0gY29sb3JcbiAgY3R4LmxpbmVXaWR0aCA9IDIgdW5sZXNzIGlzX3Jvb3RcbiAgY3R4LmZpbGwoKVxuICBjdHguc3Ryb2tlKClcbiAgY3R4LnN0cm9rZVN0eWxlID0gJ2JsYWNrJ1xuICBjdHgubGluZVdpZHRoID0gMVxuXG5kcmF3X2ZyZXRib2FyZCA9IChjdHgsIHBvc2l0aW9ucykgLT5cbiAgZHJhd19mcmV0Ym9hcmRfc3RyaW5ncyBjdHhcbiAgZHJhd19mcmV0Ym9hcmRfZnJldHMgY3R4XG4gIGRyYXdfZnJldGJvYXJkX2Zpbmdlcl9wb3NpdGlvbiBjdHgsIHBvc2l0aW9uLCBwb3NpdGlvbiBmb3IgcG9zaXRpb24gaW4gKHBvc2l0aW9ucyBvciBbXSlcblxubW9kdWxlLmV4cG9ydHMgPVxuICBkcmF3OiBkcmF3X2ZyZXRib2FyZFxuICBoZWlnaHQ6IHBhZGRlZF9mcmV0Ym9hcmRfaGVpZ2h0XG4gIHdpZHRoOiBwYWRkZWRfZnJldGJvYXJkX3dpZHRoXG4iLCJ1dGlsID0gcmVxdWlyZSAndXRpbCdcbl8gPSByZXF1aXJlICd1bmRlcnNjb3JlJ1xue2ludGVydmFsX2NsYXNzX2JldHdlZW59ID0gcmVxdWlyZSAnLi90aGVvcnknXG5GcmV0Ym9hcmRNb2RlbCA9IHJlcXVpcmUgJy4vZnJldGJvYXJkX21vZGVsJ1xuXG57XG4gIEZyZXROdW1iZXJzXG4gIE9wZW5TdHJpbmdQaXRjaGVzXG4gIFN0cmluZ051bWJlcnNcbiAgZnJldGJvYXJkX3Bvc2l0aW9uc19lYWNoXG4gIHBpdGNoX251bWJlcl9mb3JfcG9zaXRpb25cbn0gPSBGcmV0Ym9hcmRNb2RlbFxuXG5yZXF1aXJlICcuL3V0aWxzJ1xuXG4jIFRoZXNlIGFyZSBcImZpbmdlcmluZ3NcIiwgbm90IFwidm9pY2luZ3NcIiwgYmVjYXVzZSB0aGV5IGFsc28gaW5jbHVkZSBiYXJyZSBpbmZvcm1hdGlvbi5cbmNsYXNzIEZpbmdlcmluZ1xuICBjb25zdHJ1Y3RvcjogKHtAcG9zaXRpb25zLCBAY2hvcmQsIEBiYXJyZXN9KSAtPlxuICAgIEBwb3NpdGlvbnMuc29ydCAoYSwgYikgLT4gYS5zdHJpbmcgLSBiLnN0cmluZ1xuXG4gIEBjYWNoZWRfZ2V0dGVyICdmcmV0c3RyaW5nJywgLT5cbiAgICBmcmV0X3ZlY3RvciA9ICgtMSBmb3IgcyBpbiBTdHJpbmdOdW1iZXJzKVxuICAgIGZyZXRfdmVjdG9yW3N0cmluZ10gPSBmcmV0IGZvciB7c3RyaW5nLCBmcmV0fSBpbiBAcG9zaXRpb25zXG4gICAgKChpZiB4ID49IDAgdGhlbiB4IGVsc2UgJ3gnKSBmb3IgeCBpbiBmcmV0X3ZlY3Rvcikuam9pbignJylcblxuICBAY2FjaGVkX2dldHRlciAnaW52ZXJzaW9uJywgLT5cbiAgICBAY2hvcmQucGl0Y2hfY2xhc3Nlcy5pbmRleE9mIGludGVydmFsX2NsYXNzX2JldHdlZW4oQGNob3JkLnJvb3QsIHBpdGNoX251bWJlcl9mb3JfcG9zaXRpb24oQHBvc2l0aW9uc1swXSkpXG5cbmZpbmRfYmFycmVzID0gKHBvc2l0aW9ucykgLT5cbiAgZnJldF9yb3dzID0gZm9yIGZuIGluIEZyZXROdW1iZXJzXG4gICAgKGZvciBzbiBpbiBTdHJpbmdOdW1iZXJzXG4gICAgICBpZiBfLmZpbmQocG9zaXRpb25zLCAocG9zKS0+IHBvcy5zdHJpbmcgPT0gc24gYW5kIHBvcy5mcmV0ID4gZm4pXG4gICAgICAgICcuJ1xuICAgICAgZWxzZSBpZiBfLmZpbmQocG9zaXRpb25zLCAocG9zKS0+IHBvcy5zdHJpbmcgPT0gc24gYW5kIHBvcy5mcmV0IDwgZm4pXG4gICAgICAgICctJ1xuICAgICAgZWxzZSBpZiBfLmZpbmQocG9zaXRpb25zLCAocG9zKSAtPiBwb3Muc3RyaW5nID09IHNuIGFuZCBwb3MuZnJldCA9PSBmbilcbiAgICAgICAgJ3gnXG4gICAgICBlbHNlXG4gICAgICAgICcgJykuam9pbignJylcbiAgYmFycmVzID0gW11cbiAgZm9yIGZwLCBmbiBpbiBmcmV0X3Jvd3NcbiAgICBjb250aW51ZSBpZiBmbiA9PSAwXG4gICAgbSA9IGZwLm1hdGNoKC9eW154XSooeFtcXC54XSt4XFwuKikkLylcbiAgICBjb250aW51ZSB1bmxlc3MgbVxuICAgIGJhcnJlcy5wdXNoXG4gICAgICBmcmV0OiBmblxuICAgICAgc3RyaW5nOiBtWzBdLmxlbmd0aCAtIG1bMV0ubGVuZ3RoXG4gICAgICBzdHJpbmdfY291bnQ6IG1bMV0ubGVuZ3RoXG4gICAgICBzdWJzdW1wdGlvbl9jb3VudDogbVsxXS5tYXRjaCgveC9nKS5sZW5ndGhcbiAgYmFycmVzXG5cbmZpbmRfYmFycmVfc2V0cyA9IChwb3NpdGlvbnMpIC0+XG4gIHBvd2Vyc2V0ID0gKHhzKSAtPlxuICAgIHJldHVybiBbW11dIHVubGVzcyB4cy5sZW5ndGhcbiAgICBbeCwgeHMuLi5dID0geHNcbiAgICB0YWlsID0gcG93ZXJzZXQgeHNcbiAgICB0YWlsLmNvbmNhdChbeF0uY29uY2F0KHlzKSBmb3IgeXMgaW4gdGFpbClcbiAgYmFycmVzID0gZmluZF9iYXJyZXMgcG9zaXRpb25zXG4gIHJldHVybiBwb3dlcnNldCBiYXJyZXNcblxuZmluZ2VyX3Bvc2l0aW9uc19vbl9jaG9yZCA9IChjaG9yZCkgLT5cbiAgcG9zaXRpb25zID0gW11cbiAgZnJldGJvYXJkX3Bvc2l0aW9uc19lYWNoIChwb3MpIC0+XG4gICAgaW50ZXJ2YWxfY2xhc3MgPSBpbnRlcnZhbF9jbGFzc19iZXR3ZWVuIGNob3JkLnJvb3QsIHBpdGNoX251bWJlcl9mb3JfcG9zaXRpb24ocG9zKVxuICAgIGRlZ3JlZV9pbmRleCA9IGNob3JkLnBpdGNoX2NsYXNzZXMuaW5kZXhPZiBpbnRlcnZhbF9jbGFzc1xuICAgIHBvc2l0aW9ucy5wdXNoIHtzdHJpbmc6IHBvcy5zdHJpbmcsIGZyZXQ6IHBvcy5mcmV0LCBpbnRlcnZhbF9jbGFzcywgZGVncmVlX2luZGV4fSBpZiBkZWdyZWVfaW5kZXggPj0gMFxuICBwb3NpdGlvbnNcblxuIyBUT0RPIGFkZCBvcHRpb25zIGZvciBzdHJ1bW1pbmcgdnMuIGZpbmdlcnN0eWxlOyBtdXRpbmc7IHNwYW5cbmZpbmdlcmluZ3NfZm9yID0gKGNob3JkLCBvcHRpb25zPXt9KSAtPlxuICBvcHRpb25zID0gXy5leHRlbmQge2ZpbHRlcjogdHJ1ZX0sIG9wdGlvbnNcbiAgd2FybiA9IGZhbHNlXG4gIHRocm93IG5ldyBFcnJvciBcIk5vIHJvb3QgZm9yICN7dXRpbC5pbnNwZWN0IGNob3JkfVwiIHVubGVzcyBjaG9yZC5yb290P1xuXG5cbiAgI1xuICAjIEdlbmVyYXRlXG4gICNcbiAgcG9zaXRpb25zID0gZmluZ2VyX3Bvc2l0aW9uc19vbl9jaG9yZChjaG9yZClcblxuICBmcmV0c19wZXJfc3RyaW5nID0gZG8gKHN0cmluZ3M9KFtdIGZvciBfXyBpbiBPcGVuU3RyaW5nUGl0Y2hlcykpIC0+XG4gICAgc3RyaW5nc1twb3NpdGlvbi5zdHJpbmddLnB1c2ggcG9zaXRpb24gZm9yIHBvc2l0aW9uIGluIHBvc2l0aW9uc1xuICAgIHN0cmluZ3NcblxuICBjb2xsZWN0X2ZpbmdlcmluZ19wb3NpdGlvbnMgPSAoc3RyaW5nX2ZyZXRzKSAtPlxuICAgIHJldHVybiBbW11dIHVubGVzcyBzdHJpbmdfZnJldHMubGVuZ3RoXG4gICAgZnJldHMgPSBzdHJpbmdfZnJldHNbMF1cbiAgICBmb2xsb3dpbmdfZmluZ2VyX3Bvc2l0aW9ucyA9IGNvbGxlY3RfZmluZ2VyaW5nX3Bvc2l0aW9ucyhzdHJpbmdfZnJldHNbMS4uXSlcbiAgICByZXR1cm4gZm9sbG93aW5nX2Zpbmdlcl9wb3NpdGlvbnMuY29uY2F0KChbbl0uY29uY2F0KHJpZ2h0KSBcXFxuICAgICAgZm9yIG4gaW4gZnJldHMgZm9yIHJpZ2h0IGluIGZvbGxvd2luZ19maW5nZXJfcG9zaXRpb25zKS4uLilcblxuICBnZW5lcmF0ZV9maW5nZXJpbmdzID0gLT5cbiAgICBfLmZsYXR0ZW4obmV3IEZpbmdlcmluZyB7cG9zaXRpb25zLCBjaG9yZCwgYmFycmVzfSBcXFxuICAgICAgZm9yIGJhcnJlcyBpbiBmaW5kX2JhcnJlX3NldHMocG9zaXRpb25zKSBcXFxuICAgICAgZm9yIHBvc2l0aW9ucyBpbiBjb2xsZWN0X2ZpbmdlcmluZ19wb3NpdGlvbnMoZnJldHNfcGVyX3N0cmluZykpXG5cbiAgY2hvcmRfbm90ZV9jb3VudCA9IGNob3JkLnBpdGNoX2NsYXNzZXMubGVuZ3RoXG5cblxuICAjXG4gICMgRmlsdGVyc1xuICAjXG5cbiAgY291bnRfZGlzdGluY3Rfbm90ZXMgPSAoZmluZ2VyaW5nKSAtPlxuICAgIF8uY2hhaW4oZmluZ2VyaW5nLnBvc2l0aW9ucykucGx1Y2soJ2ludGVydmFsX2NsYXNzJykudW5pcSgpLnZhbHVlKCkubGVuZ3RoXG5cbiAgaGFzX2FsbF9ub3RlcyA9IChmaW5nZXJpbmcpIC0+XG4gICAgcmV0dXJuIGNvdW50X2Rpc3RpbmN0X25vdGVzKGZpbmdlcmluZykgPT0gY2hvcmRfbm90ZV9jb3VudFxuXG4gIG11dGVkX21lZGlhbF9zdHJpbmdzID0gKGZpbmdlcmluZykgLT5cbiAgICByZXR1cm4gZmluZ2VyaW5nLmZyZXRzdHJpbmcubWF0Y2goL1xcZHgrXFxkLylcblxuICBtdXRlZF90cmVibGVfc3RyaW5ncyA9IChmaW5nZXJpbmcpIC0+XG4gICAgcmV0dXJuIGZpbmdlcmluZy5mcmV0c3RyaW5nLm1hdGNoKC94JC8pXG5cbiAgZmluZ2VyX2NvdW50ID0gKGZpbmdlcmluZykgLT5cbiAgICBuID0gKHBvcyBmb3IgcG9zIGluIGZpbmdlcmluZy5wb3NpdGlvbnMgd2hlbiBwb3MuZnJldCA+IDApLmxlbmd0aFxuICAgIG4gLT0gYmFycmUuc3Vic3VtcHRpb25fY291bnQgZm9yIGJhcnJlIGluIGZpbmdlcmluZy5iYXJyZXNcbiAgICBuXG5cbiAgZm91cl9maW5nZXJzX29yX2Zld2VyID0gKGZpbmdlcmluZykgLT5cbiAgICByZXR1cm4gZmluZ2VyX2NvdW50KGZpbmdlcmluZykgPD0gNFxuXG4gIGNtcCA9IChmbikgLT4gKHguLi4pIC0+ICFmbih4Li4uKVxuXG4gICMgQ29uc3RydWN0IHRoZSBmaWx0ZXIgc2V0XG5cbiAgZmlsdGVycyA9IFtdXG4gIGZpbHRlcnMucHVzaCBuYW1lOiAnaGFzIGFsbCBjaG9yZCBub3RlcycsIHNlbGVjdDogaGFzX2FsbF9ub3Rlc1xuXG4gIGlmIG9wdGlvbnMuZmlsdGVyXG4gICAgZmlsdGVycy5wdXNoIG5hbWU6ICdmb3VyIGZpbmdlcnMgb3IgZmV3ZXInLCBzZWxlY3Q6IGZvdXJfZmluZ2Vyc19vcl9mZXdlclxuXG4gIHVubGVzcyBvcHRpb25zLmZpbmdlcnBpY2tpbmdcbiAgICBmaWx0ZXJzLnB1c2ggbmFtZTogJ25vIG11dGVkIG1lZGlhbCBzdHJpbmdzJywgcmVqZWN0OiBtdXRlZF9tZWRpYWxfc3RyaW5nc1xuICAgIGZpbHRlcnMucHVzaCBuYW1lOiAnbm8gbXV0ZWQgdHJlYmxlIHN0cmluZ3MnLCByZWplY3Q6IG11dGVkX3RyZWJsZV9zdHJpbmdzXG5cbiAgIyBmaWx0ZXIgYnkgYWxsIHRoZSBmaWx0ZXJzIGluIHRoZSBsaXN0LCBleGNlcHQgaWdub3JlIHRob3NlIHRoYXQgd291bGRuJ3QgcGFzcyBhbnl0aGluZ1xuICBmaWx0ZXJfZmluZ2VyaW5ncyA9IChmaW5nZXJpbmdzKSAtPlxuICAgIGZvciB7bmFtZSwgc2VsZWN0LCByZWplY3R9IGluIGZpbHRlcnNcbiAgICAgIHNlbGVjdCB8fD0gY21wKHJlamVjdClcbiAgICAgIGZpbHRlcmVkID0gKGZpbmdlcmluZyBmb3IgZmluZ2VyaW5nIGluIGZpbmdlcmluZ3Mgd2hlbiBzZWxlY3QgZmluZ2VyaW5nKVxuICAgICAgdW5sZXNzIGZpbHRlcmVkLmxlbmd0aFxuICAgICAgICBjb25zb2xlLndhcm4gXCIje2Nob3JkX25hbWV9OiBubyBmaW5nZXJpbmdzIHBhc3MgZmlsdGVyIFxcXCIje25hbWV9XFxcIlwiIGlmIHdhcm5cbiAgICAgICAgZmlsdGVyZWQgPSBmaW5nZXJpbmdzXG4gICAgICBmaW5nZXJpbmdzID0gZmlsdGVyZWRcbiAgICByZXR1cm4gZmluZ2VyaW5nc1xuXG5cbiAgI1xuICAjIFNvcnRcbiAgI1xuXG4gICMgRklYTUUgY291bnQgcGl0Y2ggY2xhc3Nlcywgbm90IHNvdW5kZWQgc3RyaW5nc1xuICBoaWdoX25vdGVfY291bnQgPSAoZmluZ2VyaW5nKSAtPlxuICAgIGZpbmdlcmluZy5wb3NpdGlvbnMubGVuZ3RoXG5cbiAgaXNfcm9vdF9wb3NpdGlvbiA9IChmaW5nZXJpbmcpIC0+XG4gICAgXyhmaW5nZXJpbmcucG9zaXRpb25zKS5zb3J0QnkoKHBvcykgLT4gcG9zLnN0cmluZylbMF0uZGVncmVlX2luZGV4ID09IDBcblxuICByZXZlcnNlX3NvcnRfa2V5ID0gKGZuKSAtPiAoYSkgLT4gLWZuKGEpXG5cbiAgIyBvcmRlcmVkIGxpc3Qgb2YgcHJlZmVyZW5jZXMsIGZyb20gbW9zdCB0byBsZWFzdCBpbXBvcnRhbnRcbiAgcHJlZmVyZW5jZXMgPSBbXG4gICAge25hbWU6ICdyb290IHBvc2l0aW9uJywga2V5OiBpc19yb290X3Bvc2l0aW9ufVxuICAgIHtuYW1lOiAnaGlnaCBub3RlIGNvdW50Jywga2V5OiBoaWdoX25vdGVfY291bnR9XG4gICAge25hbWU6ICdhdm9pZCBiYXJyZXMnLCBrZXk6IHJldmVyc2Vfc29ydF9rZXkoKGZpbmdlcmluZykgLT4gZmluZ2VyaW5nLmJhcnJlcy5sZW5ndGgpfVxuICAgIHtuYW1lOiAnbG93IGZpbmdlciBjb3VudCcsIGtleTogcmV2ZXJzZV9zb3J0X2tleShmaW5nZXJfY291bnQpfVxuICBdXG5cbiAgc29ydF9maW5nZXJpbmdzID0gKGZpbmdlcmluZ3MpIC0+XG4gICAgZmluZ2VyaW5ncyA9IF8oZmluZ2VyaW5ncykuc29ydEJ5KGtleSkgZm9yIHtrZXl9IGluIHByZWZlcmVuY2VzLnNsaWNlKDApLnJldmVyc2UoKVxuICAgIGZpbmdlcmluZ3MucmV2ZXJzZSgpXG4gICAgcmV0dXJuIGZpbmdlcmluZ3NcblxuXG4gICNcbiAgIyBHZW5lcmF0ZSwgZmlsdGVyLCBhbmQgc29ydFxuICAjXG5cbiAgY2hvcmRfbmFtZSA9IGNob3JkLm5hbWVcbiAgZmluZ2VyaW5ncyA9IGdlbmVyYXRlX2ZpbmdlcmluZ3MoKVxuICBmaW5nZXJpbmdzID0gZmlsdGVyX2ZpbmdlcmluZ3MgZmluZ2VyaW5nc1xuICBmaW5nZXJpbmdzID0gc29ydF9maW5nZXJpbmdzIGZpbmdlcmluZ3NcblxuICByZXR1cm4gZmluZ2VyaW5nc1xuXG5iZXN0X2ZpbmdlcmluZ19mb3IgPSAoY2hvcmQpIC0+XG4gIHJldHVybiBmaW5nZXJpbmdzX2ZvcihjaG9yZClbMF1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGJlc3RfZmluZ2VyaW5nX2ZvclxuICBmaW5nZXJpbmdzX2ZvclxuICBmaW5nZXJfcG9zaXRpb25zX29uX2Nob3JkXG59XG4iLCJ7aW50ZXJ2YWxfY2xhc3NfYmV0d2Vlbn0gPSByZXF1aXJlKCcuL3RoZW9yeScpXG5cbiNcbiMgRnJldGJvYXJkXG4jXG5cblN0cmluZ051bWJlcnMgPSBbMC4uNV1cblN0cmluZ0NvdW50ID0gU3RyaW5nTnVtYmVycy5sZW5ndGhcblxuRnJldE51bWJlcnMgPSBbMC4uNF0gICMgaW5jbHVkZXMgbnV0XG5GcmV0Q291bnQgPSBGcmV0TnVtYmVycy5sZW5ndGggLSAxICAjIGRvZXNuJ3QgaW5jbHVkZSBudXRcblxuU3RyaW5nSW50ZXJ2YWxzID0gWzUsIDUsIDUsIDQsIDVdXG5cbk9wZW5TdHJpbmdQaXRjaGVzID0gZG8gKG51bWJlcnM9W10pIC0+XG4gIG51bWJlcnMucHVzaCAyMFxuICBmb3IgaW50ZXJ2YWwsIGkgaW4gU3RyaW5nSW50ZXJ2YWxzXG4gICAgbnVtYmVycy5wdXNoIG51bWJlcnNbaV0gKyBpbnRlcnZhbFxuICBudW1iZXJzXG5cbnBpdGNoX251bWJlcl9mb3JfcG9zaXRpb24gPSAoe3N0cmluZywgZnJldH0pIC0+XG4gIE9wZW5TdHJpbmdQaXRjaGVzW3N0cmluZ10gKyBmcmV0XG5cbmZyZXRib2FyZF9wb3NpdGlvbnNfZWFjaCA9IChmbikgLT5cbiAgZm9yIHN0cmluZyBpbiBTdHJpbmdOdW1iZXJzXG4gICAgZm9yIGZyZXQgaW4gRnJldE51bWJlcnNcbiAgICAgIGZuIHN0cmluZzogc3RyaW5nLCBmcmV0OiBmcmV0XG5cbmludGVydmFsc19mcm9tID0gKHJvb3RfcG9zaXRpb24sIHNlbWl0b25lcykgLT5cbiAgcm9vdF9ub3RlX251bWJlciA9IHBpdGNoX251bWJlcl9mb3JfcG9zaXRpb24ocm9vdF9wb3NpdGlvbilcbiAgcG9zaXRpb25zID0gW11cbiAgZnJldGJvYXJkX3Bvc2l0aW9uc19lYWNoIChmaW5nZXJfcG9zaXRpb24pIC0+XG4gICAgcmV0dXJuIHVubGVzcyBpbnRlcnZhbF9jbGFzc19iZXR3ZWVuKHJvb3Rfbm90ZV9udW1iZXIsIHBpdGNoX251bWJlcl9mb3JfcG9zaXRpb24oZmluZ2VyX3Bvc2l0aW9uKSkgPT0gc2VtaXRvbmVzXG4gICAgcG9zaXRpb25zLnB1c2ggZmluZ2VyX3Bvc2l0aW9uXG4gIHJldHVybiBwb3NpdGlvbnNcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIFN0cmluZ051bWJlcnNcbiAgU3RyaW5nQ291bnRcbiAgRnJldE51bWJlcnNcbiAgRnJldENvdW50XG4gIE9wZW5TdHJpbmdQaXRjaGVzXG4gIGZyZXRib2FyZF9wb3NpdGlvbnNfZWFjaFxuICBwaXRjaF9udW1iZXJfZm9yX3Bvc2l0aW9uXG4gIGludGVydmFsc19mcm9tXG59XG4iLCJfID0gcmVxdWlyZSAndW5kZXJzY29yZSdcbntJbnRlcnZhbE5hbWVzfSA9IHJlcXVpcmUgJy4vdGhlb3J5J1xue2Jsb2NrLCBkcmF3X3RleHQsIHdpdGhfZ3JhcGhpY3NfY29udGV4dCwgd2l0aF9hbGlnbm1lbnR9ID0gcmVxdWlyZSAnLi9sYXlvdXQnXG5DaG9yZERpYWdyYW0gPSByZXF1aXJlICcuL2Nob3JkX2RpYWdyYW0nXG5cbkRlZmF1bHRTdHlsZSA9XG4gIGludGVydmFsX2NsYXNzX2NvbG9yczogQ2hvcmREaWFncmFtLmRlZmF1bHRTdHlsZS5pbnRlcnZhbF9jbGFzc19jb2xvcnNcbiAgcmFkaXVzOiA1MFxuICBjZW50ZXI6IHRydWVcbiAgZmlsbF9jZWxsczogZmFsc2VcbiAgbGFiZWxfY2VsbHM6IGZhbHNlXG5cbiMgRW51bWVyYXRlIHRoZXNlIGV4cGxpY2l0bHkgaW5zdGVhZCBvZiBjb21wdXRpbmcgdGhlbSxcbiMgc28gdGhhdCB3ZSBjYW4gZmluZS10dW5lIHRoZSBwb3NpdGlvbiBvZiBjZWxscyB0aGF0XG4jIGNvdWxkIGJlIHBsYWNlZCBhdCBvbmUgb2Ygc2V2ZXJhbCBkaWZmZXJlbnQgbG9jYXRpb25zLlxuSW50ZXJ2YWxWZWN0b3JzID1cbiAgMjoge1A1OiAtMSwgbTM6IC0xfVxuICAzOiB7bTM6IDF9XG4gIDQ6IHtNMzogMX1cbiAgNToge1A1OiAtMX1cbiAgNjoge20zOiAyfVxuICAxMToge1A1OiAxLCBNMzogMX1cblxuIyBSZXR1cm5zIGEgcmVjb3JkIHttMyBNMyBQNX0gdGhhdCByZXByZXNlbnRzIHRoZSBjYW5vbmljYWwgdmVjdG9yIChhY2NvcmRpbmcgdG8gYEludGVydmFsVmVjdG9yc2ApXG4jIG9mIHRoZSBpbnRlcnZhbCBjbGFzcy5cbmludGVydmFsX2NsYXNzX3ZlY3RvcnMgPSAoaW50ZXJ2YWxfY2xhc3MpIC0+XG4gIG9yaWdpbmFsX2ludGVydmFsX2NsYXNzID0gaW50ZXJ2YWxfY2xhc3MgIyBmb3IgZXJyb3IgcmVwb3J0aW5nXG4gIGFkanVzdG1lbnRzID0ge31cbiAgYWRqdXN0ID0gKGRfaWMsIGludGVydmFscykgLT5cbiAgICBpbnRlcnZhbF9jbGFzcyArPSBkX2ljXG4gICAgYWRqdXN0bWVudHNba10gPz0gMCBmb3IgayBvZiBpbnRlcnZhbHNcbiAgICBhZGp1c3RtZW50c1trXSArPSB2IGZvciBrLCB2IG9mIGludGVydmFsc1xuICBhZGp1c3QgLTI0LCBQNTogNCwgTTM6IC0xIHdoaWxlIGludGVydmFsX2NsYXNzID49IDI0XG4gIGFkanVzdCAtMTIsIE0zOiAzIHdoaWxlIGludGVydmFsX2NsYXNzID49IDEyXG4gIFtyZWNvcmQsIHNpZ25dID0gW0ludGVydmFsVmVjdG9yc1tpbnRlcnZhbF9jbGFzc10sIDFdXG4gIFtyZWNvcmQsIHNpZ25dID0gW0ludGVydmFsVmVjdG9yc1sxMiAtIGludGVydmFsX2NsYXNzXSwgLTFdIHVubGVzcyByZWNvcmRcbiAgaW50ZXJ2YWxzID0gXy5leHRlbmQge20zOiAwLCBNMzogMCwgUDU6IDAsIHNpZ246IDF9LCByZWNvcmRcbiAgaW50ZXJ2YWxzW2tdICo9IHNpZ24gZm9yIGsgb2YgaW50ZXJ2YWxzXG4gIGludGVydmFsc1trXSArPSB2IGZvciBrLCB2IG9mIGFkanVzdG1lbnRzXG4gIGNvbXB1dGVkX3NlbWl0b25lcyA9ICgxMiArIGludGVydmFscy5QNSAqIDcgKyBpbnRlcnZhbHMuTTMgKiA0ICsgaW50ZXJ2YWxzLm0zICogMykgJSAxMlxuICB1bmxlc3MgY29tcHV0ZWRfc2VtaXRvbmVzID09IG9yaWdpbmFsX2ludGVydmFsX2NsYXNzICUgMTJcbiAgICBjb25zb2xlLmVycm9yIFwiRXJyb3IgY29tcHV0aW5nIGdyaWQgcG9zaXRpb24gZm9yICN7b3JpZ2luYWxfaW50ZXJ2YWxfY2xhc3N9OlxcblwiXG4gICAgICAsIFwiICAje29yaWdpbmFsX2ludGVydmFsX2NsYXNzfSAtPlwiLCBpbnRlcnZhbHNcbiAgICAgICwgJy0+JywgY29tcHV0ZWRfc2VtaXRvbmVzXG4gICAgICAsICchPScsIG9yaWdpbmFsX2ludGVydmFsX2NsYXNzICUgMTJcbiAgaW50ZXJ2YWxzXG5cbmRyYXdfaGFybW9uaWNfdGFibGUgPSAoaW50ZXJ2YWxfY2xhc3Nlcywgb3B0aW9ucz17fSkgLT5cbiAgb3B0aW9ucyA9IF8uZXh0ZW5kIHtkcmF3OiB0cnVlfSwgRGVmYXVsdFN0eWxlLCBvcHRpb25zXG4gIGNvbG9ycyA9IG9wdGlvbnMuaW50ZXJ2YWxfY2xhc3NfY29sb3JzXG4gIGludGVydmFsX2NsYXNzZXMgPSBbMF0uY29uY2F0IGludGVydmFsX2NsYXNzZXMgdW5sZXNzIDAgaW4gaW50ZXJ2YWxfY2xhc3Nlc1xuICBjZWxsX3JhZGl1cyA9IG9wdGlvbnMucmFkaXVzXG4gIGhleF9yYWRpdXMgPSBjZWxsX3JhZGl1cyAvIDJcblxuICBjZWxsX2NlbnRlciA9IChpbnRlcnZhbF9rbGFzcykgLT5cbiAgICB2ZWN0b3JzID0gaW50ZXJ2YWxfY2xhc3NfdmVjdG9ycyBpbnRlcnZhbF9rbGFzc1xuICAgIGR5ID0gdmVjdG9ycy5QNSArICh2ZWN0b3JzLk0zICsgdmVjdG9ycy5tMykgLyAyXG4gICAgZHggPSB2ZWN0b3JzLk0zIC0gdmVjdG9ycy5tM1xuICAgIHggPSBkeCAqIGNlbGxfcmFkaXVzICogLjhcbiAgICB5ID0gLWR5ICogY2VsbF9yYWRpdXMgKiAuOTVcbiAgICB7eCwgeX1cblxuICBib3VuZHMgPSB7bGVmdDogSW5maW5pdHksIHRvcDogSW5maW5pdHksIHJpZ2h0OiAtSW5maW5pdHksIGJvdHRvbTogLUluZmluaXR5fVxuICBmb3IgaW50ZXJ2YWxfa2xhc3MgaW4gaW50ZXJ2YWxfY2xhc3Nlc1xuICAgIHt4LCB5fSA9IGNlbGxfY2VudGVyIGludGVydmFsX2tsYXNzXG4gICAgYm91bmRzLmxlZnQgPSBNYXRoLm1pbiBib3VuZHMubGVmdCwgeCAtIGhleF9yYWRpdXNcbiAgICBib3VuZHMudG9wID0gTWF0aC5taW4gYm91bmRzLnRvcCwgeSAtIGhleF9yYWRpdXNcbiAgICBib3VuZHMucmlnaHQgPSBNYXRoLm1heCBib3VuZHMucmlnaHQsIHggKyBoZXhfcmFkaXVzXG4gICAgYm91bmRzLmJvdHRvbSA9IE1hdGgubWF4IGJvdW5kcy5ib3R0b20sIHkgKyBoZXhfcmFkaXVzXG5cbiAgcmV0dXJuIHt3aWR0aDogYm91bmRzLnJpZ2h0IC0gYm91bmRzLmxlZnQsIGhlaWdodDogYm91bmRzLmJvdHRvbSAtIGJvdW5kcy50b3B9IHVubGVzcyBvcHRpb25zLmRyYXdcblxuICB3aXRoX2dyYXBoaWNzX2NvbnRleHQgKGN0eCkgLT5cbiAgICBjdHgudHJhbnNsYXRlIC1ib3VuZHMubGVmdCwgLWJvdW5kcy5ib3R0b21cblxuICAgIGZvciBpbnRlcnZhbF9rbGFzcyBpbiBpbnRlcnZhbF9jbGFzc2VzXG4gICAgICBpc19yb290ID0gaW50ZXJ2YWxfa2xhc3MgPT0gMFxuICAgICAgY29sb3IgPSBjb2xvcnNbaW50ZXJ2YWxfa2xhc3MgJSAxMl1cbiAgICAgIGNvbG9yIHx8PSBjb2xvcnNbMTIgLSBpbnRlcnZhbF9rbGFzc11cbiAgICAgIGN0eC5iZWdpblBhdGgoKVxuICAgICAge3gsIHl9ID0gY2VsbF9jZW50ZXIgaW50ZXJ2YWxfa2xhc3NcblxuICAgICAgIyBmcmFtZVxuICAgICAgZm9yIGkgaW4gWzAuLjZdXG4gICAgICAgIGEgPSBpICogTWF0aC5QSSAvIDNcbiAgICAgICAgcG9zID0gW3ggKyBoZXhfcmFkaXVzICogTWF0aC5jb3MoYSksIHkgKyBoZXhfcmFkaXVzICogTWF0aC5zaW4oYSldXG4gICAgICAgIGN0eC5tb3ZlVG8gcG9zLi4uIGlmIGkgPT0gMFxuICAgICAgICBjdHgubGluZVRvIHBvcy4uLlxuICAgICAgY3R4LnN0cm9rZVN0eWxlID0gJ2dyYXknXG4gICAgICBjdHguc3Ryb2tlKClcblxuICAgICAgIyBmaWxsXG4gICAgICBpZiBpc19yb290IG9yIChvcHRpb25zLmZpbGxfY2VsbHMgYW5kIGludGVydmFsX2tsYXNzIDwgMTIpXG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSBjb2xvciBvciAncmdiYSgyNTUsMCwwLDAuMTUpJ1xuICAgICAgICBjdHguZ2xvYmFsQWxwaGEgPSAwLjMgdW5sZXNzIGlzX3Jvb3RcbiAgICAgICAgY3R4LmZpbGwoKVxuICAgICAgICBjdHguZ2xvYmFsQWxwaGEgPSAxXG5cbiAgICAgIGNvbnRpbnVlIGlmIGlzX3Jvb3Qgb3Igb3B0aW9ucy5maWxsX2NlbGxzXG5cbiAgICAgICMgZmlsbFxuICAgICAgY3R4Lmdsb2JhbEFscGhhID0gMC4zIGlmIG9wdGlvbnMubGFiZWxfY2VsbHNcbiAgICAgIGRvIC0+XG4gICAgICAgIFtkeCwgZHksIGRuXSA9IFsteSwgeCwgMiAvIE1hdGguc3FydCh4KnggKyB5KnkpXVxuICAgICAgICBkeCAqPSBkblxuICAgICAgICBkeSAqPSBkblxuICAgICAgICBjdHguYmVnaW5QYXRoKClcbiAgICAgICAgY3R4Lm1vdmVUbyAwLCAwXG4gICAgICAgIGN0eC5saW5lVG8geCArIGR4LCB5ICsgZHlcbiAgICAgICAgY3R4LmxpbmVUbyB4IC0gZHgsIHkgLSBkeVxuICAgICAgICBjdHguZmlsbFN0eWxlID0gY29sb3JcbiAgICAgICAgY3R4LmZpbGwoKVxuXG4gICAgICBjdHguYmVnaW5QYXRoKClcbiAgICAgIGN0eC5hcmMgeCwgeSwgMiwgMCwgMiAqIE1hdGguUEksIGZhbHNlXG4gICAgICBjdHguZmlsbFN0eWxlID0gY29sb3JcbiAgICAgIGN0eC5maWxsKClcbiAgICAgIGN0eC5nbG9iYWxBbHBoYSA9IDFcblxuICAgIGN0eC5iZWdpblBhdGgoKVxuICAgIGN0eC5hcmMgMCwgMCwgMi41LCAwLCAyICogTWF0aC5QSSwgZmFsc2VcbiAgICBjdHguZmlsbFN0eWxlID0gJ3JlZCdcbiAgICBjdHguZmlsbCgpXG5cbiAgICBpZiBvcHRpb25zLmxhYmVsX2NlbGxzXG4gICAgICBmb3IgaW50ZXJ2YWxfa2xhc3MgaW4gaW50ZXJ2YWxfY2xhc3Nlc1xuICAgICAgICBsYWJlbCA9IEludGVydmFsTmFtZXNbaW50ZXJ2YWxfa2xhc3NdXG4gICAgICAgIGxhYmVsID0gJ1InIGlmIGludGVydmFsX2tsYXNzID09IDBcbiAgICAgICAge3gsIHl9ID0gY2VsbF9jZW50ZXIgaW50ZXJ2YWxfa2xhc3NcbiAgICAgICAgZHJhd190ZXh0IGxhYmVsLCBmb250OiAnMTBwdCBUaW1lcycsIGZpbGxTdHlsZTogJ2JsYWNrJywgeDogeCwgeTogeSwgZ3Jhdml0eTogJ2NlbnRlcidcblxuaGFybW9uaWNfdGFibGVfYmxvY2sgPSAodG9uZXMsIG9wdGlvbnMpIC0+XG4gIGRpbWVuc2lvbnMgPSBkcmF3X2hhcm1vbmljX3RhYmxlIHRvbmVzLCBfLmV4dGVuZCh7fSwgb3B0aW9ucywgY29tcHV0ZV9ib3VuZHM6IHRydWUsIGRyYXc6IGZhbHNlKVxuICBibG9ja1xuICAgIHdpZHRoOiBkaW1lbnNpb25zLndpZHRoXG4gICAgaGVpZ2h0OiBkaW1lbnNpb25zLmhlaWdodFxuICAgIGRyYXc6IC0+XG4gICAgICBkcmF3X2hhcm1vbmljX3RhYmxlIHRvbmVzLCBvcHRpb25zXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBkcmF3OiBkcmF3X2hhcm1vbmljX3RhYmxlXG4gIGJsb2NrOiBoYXJtb25pY190YWJsZV9ibG9ja1xufVxuIiwiZnMgPSByZXF1aXJlICdmcydcbnBhdGggPSByZXF1aXJlICdwYXRoJ1xudXRpbCA9IHJlcXVpcmUgJ3V0aWwnXG5fID0gcmVxdWlyZSAndW5kZXJzY29yZSdcbkNhbnZhcyA9IHJlcXVpcmUgJ2NhbnZhcydcblxuXG4jXG4jIERyYXdpbmdcbiNcblxuQ29udGV4dCA9XG4gIGNhbnZhczogbnVsbFxuICBjdHg6IG51bGxcblxuZXJhc2VfYmFja2dyb3VuZCA9IC0+XG4gIHtjYW52YXMsIGN0eH0gPSBDb250ZXh0XG4gIGN0eC5maWxsU3R5bGUgPSAnd2hpdGUnXG4gIGN0eC5maWxsUmVjdCAwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHRcblxubWVhc3VyZV90ZXh0ID0gKHRleHQsIHtmb250fT17fSkgLT5cbiAgY3R4ID0gQ29udGV4dC5jdHhcbiAgY3R4LmZvbnQgPSBmb250IGlmIGZvbnRcbiAgY3R4Lm1lYXN1cmVUZXh0IHRleHRcblxuZHJhd190ZXh0ID0gKHRleHQsIG9wdGlvbnM9e30pIC0+XG4gIGN0eCA9IENvbnRleHQuY3R4XG4gIG9wdGlvbnMgPSB0ZXh0IGlmIF8uaXNPYmplY3QgdGV4dFxuICB7Zm9udCwgZmlsbFN0eWxlLCB4LCB5LCBncmF2aXR5LCB3aWR0aH0gPSBvcHRpb25zXG4gIGdyYXZpdHkgfHw9ICcnXG4gIGlmIG9wdGlvbnMuY2hvaWNlc1xuICAgIGZvciBjaG9pY2UgaW4gb3B0aW9ucy5jaG9pY2VzXG4gICAgICB0ZXh0ID0gY2hvaWNlIGlmIF8uaXNTdHJpbmcgY2hvaWNlXG4gICAgICB7Zm9udH0gPSBjaG9pY2UgaWYgXy5pc09iamVjdCBjaG9pY2VcbiAgICAgIGJyZWFrIGlmIG1lYXN1cmVfdGV4dCh0ZXh0LCBmb250OiBmb250KS53aWR0aCA8PSBvcHRpb25zLndpZHRoXG4gIGN0eC5mb250ID0gZm9udCBpZiBmb250XG4gIGN0eC5maWxsU3R5bGUgPSBmaWxsU3R5bGUgaWYgZmlsbFN0eWxlXG4gIG0gPSBjdHgubWVhc3VyZVRleHQgdGV4dFxuICB4IHx8PSAwXG4gIHkgfHw9IDBcbiAgeCAtPSBtLndpZHRoIC8gMiBpZiBncmF2aXR5Lm1hdGNoKC9eKHRvcHxjZW50ZXJ8bWlkZGxlfGNlbnRlcmJvdHRvbSkkL2kpXG4gIHggLT0gbS53aWR0aCBpZiBncmF2aXR5Lm1hdGNoKC9eKHJpZ2h0fHRvcFJpZ2h0fGJvdFJpZ2h0KSQvaSlcbiAgeSAtPSBtLmVtSGVpZ2h0RGVzY2VudCBpZiBncmF2aXR5Lm1hdGNoKC9eKGJvdHRvbXxib3RMZWZ0fGJvdFJpZ2h0KSQvaSlcbiAgeSArPSBtLmVtSGVpZ2h0QXNjZW50IGlmIGdyYXZpdHkubWF0Y2goL14odG9wfHRvcExlZnR8dG9wUmlnaHQpJC9pKVxuICBjdHguZmlsbFRleHQgdGV4dCwgeCwgeVxuXG53aXRoX2NhbnZhcyA9IChjYW52YXMsIGNiKSAtPlxuICBzYXZlZENhbnZhcyA9IENvbnRleHQuY2FudmFzXG4gIHNhdmVkQ29udGV4dCA9IENvbnRleHQuY29udGV4dFxuICB0cnlcbiAgICBDb250ZXh0LmNhbnZhcyA9IGNhbnZhc1xuICAgIENvbnRleHQuY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJylcbiAgICByZXR1cm4gY2IoKVxuICBmaW5hbGx5XG4gICAgQ29udGV4dC5jYW52YXMgPSBzYXZlZENhbnZhc1xuICAgIENvbnRleHQuY29udGV4dCA9IHNhdmVkQ29udGV4dFxuXG53aXRoX2dyYXBoaWNzX2NvbnRleHQgPSAoZm4pIC0+XG4gIGN0eCA9IENvbnRleHQuY3R4XG4gIGN0eC5zYXZlKClcbiAgdHJ5XG4gICAgZm4gY3R4XG4gIGZpbmFsbHlcbiAgICBjdHgucmVzdG9yZSgpXG5cblxuI1xuIyBCb3gtYmFzZWQgRGVjbGFyYXRpdmUgTGF5b3V0XG4jXG5cbmJveCA9IChwYXJhbXMpIC0+XG4gIGJveCA9IF8uZXh0ZW5kIHt3aWR0aDogMH0sIHBhcmFtc1xuICBib3guaGVpZ2h0ID89IChib3guYXNjZW50ID8gMCkgKyAoYm94LmRlc2NlbnQgPyAwKVxuICBib3guYXNjZW50ID89IGJveC5oZWlnaHQgLSAoYm94LmRlc2NlbnQgPyAwKVxuICBib3guZGVzY2VudCA/PSBib3guaGVpZ2h0IC0gYm94LmFzY2VudFxuICBib3hcblxucGFkX2JveCA9IChib3gsIG9wdGlvbnMpIC0+XG4gIGJveC5oZWlnaHQgKz0gb3B0aW9ucy5ib3R0b20gaWYgb3B0aW9ucy5ib3R0b21cbiAgYm94LmRlc2NlbnQgPSAoKGJveC5kZXNjZW50ID8gMCkgKyBvcHRpb25zLmJvdHRvbSkgaWYgb3B0aW9ucy5ib3R0b21cbiAgYm94XG5cbnRleHRfYm94ID0gKHRleHQsIG9wdGlvbnMpIC0+XG4gIG9wdGlvbnMgPSBfLmV4dGVuZCB7fSwgb3B0aW9ucywgZ3Jhdml0eTogZmFsc2VcbiAgbWVhc3VyZSA9IG1lYXN1cmVfdGV4dCB0ZXh0LCBvcHRpb25zXG4gIGJveFxuICAgIHdpZHRoOiBtZWFzdXJlLndpZHRoXG4gICAgaGVpZ2h0OiBtZWFzdXJlLmVtSGVpZ2h0QXNjZW50ICsgbWVhc3VyZS5lbUhlaWdodERlc2NlbnRcbiAgICBkZXNjZW50OiBtZWFzdXJlLmVtSGVpZ2h0RGVzY2VudFxuICAgIGRyYXc6IC0+IGRyYXdfdGV4dCB0ZXh0LCBvcHRpb25zXG5cbnZib3ggPSAoYm94ZXMuLi4pIC0+XG4gIG9wdGlvbnMgPSB7fVxuICBvcHRpb25zID0gYm94ZXMucG9wKCkgdW5sZXNzIGJveGVzW2JveGVzLmxlbmd0aCAtIDFdLndpZHRoP1xuICBvcHRpb25zID0gXy5leHRlbmQge2FsaWduOiAnbGVmdCd9LCBvcHRpb25zXG4gIHdpZHRoID0gTWF0aC5tYXggXy5wbHVjayhib3hlcywgJ3dpZHRoJykuLi5cbiAgaGVpZ2h0ID0gXy5wbHVjayhib3hlcywgJ2hlaWdodCcpLnJlZHVjZSAoYSwgYikgLT4gYSArIGJcbiAgZGVzY2VudCA9IGJveGVzW2JveGVzLmxlbmd0aCAtIDFdLmRlc2NlbnRcbiAgaWYgb3B0aW9ucy5iYXNlbGluZVxuICAgIGJveGVzX2JlbG93ID0gYm94ZXNbYm94ZXMuaW5kZXhPZihvcHRpb25zLmJhc2VsaW5lKSsxLi4uXVxuICAgIGRlc2NlbnQgPSBvcHRpb25zLmJhc2VsaW5lLmRlc2NlbnQgKyBfLnBsdWNrKGJveGVzX2JlbG93LCAnaGVpZ2h0JykucmVkdWNlICgoYSwgYikgLT4gYSArIGIpLCAwXG4gIGJveFxuICAgIHdpZHRoOiB3aWR0aFxuICAgIGhlaWdodDogaGVpZ2h0XG4gICAgZGVzY2VudDogZGVzY2VudFxuICAgIGRyYXc6IC0+XG4gICAgICBkeSA9IC1oZWlnaHRcbiAgICAgIGJveGVzLmZvckVhY2ggKGIxKSAtPlxuICAgICAgICB3aXRoX2dyYXBoaWNzX2NvbnRleHQgKGN0eCkgLT5cbiAgICAgICAgICBkeCA9IHN3aXRjaCBvcHRpb25zLmFsaWduXG4gICAgICAgICAgICB3aGVuICdsZWZ0JyB0aGVuIDBcbiAgICAgICAgICAgIHdoZW4gJ2NlbnRlcicgdGhlbiBNYXRoLm1heCAwLCAod2lkdGggLSBiMS53aWR0aCkgLyAyXG4gICAgICAgICAgY3R4LnRyYW5zbGF0ZSBkeCwgZHkgKyBiMS5oZWlnaHQgLSBiMS5kZXNjZW50XG4gICAgICAgICAgYjEuZHJhdz8oY3R4KVxuICAgICAgICAgIGR5ICs9IGIxLmhlaWdodFxuXG5hYm92ZSA9IHZib3hcblxuaGJveCA9IChiMSwgYjIpIC0+XG4gIGNvbnRhaW5lcl9zaXplID0gQ3VycmVudEJvb2s/LnBhZ2Vfb3B0aW9ucyBvciBDdXJyZW50UGFnZVxuICBib3hlcyA9IFtiMSwgYjJdXG4gIGhlaWdodCA9IE1hdGgubWF4IF8ucGx1Y2soYm94ZXMsICdoZWlnaHQnKS4uLlxuICB3aWR0aCA9IF8ucGx1Y2soYm94ZXMsICd3aWR0aCcpLnJlZHVjZSAoYSwgYikgLT4gYSArIGJcbiAgd2lkdGggPSBjb250YWluZXJfc2l6ZS53aWR0aCBpZiB3aWR0aCA9PSBJbmZpbml0eVxuICBzcHJpbmdfY291bnQgPSAoYiBmb3IgYiBpbiBib3hlcyB3aGVuIGIud2lkdGggPT0gSW5maW5pdHkpLmxlbmd0aFxuICBib3hcbiAgICB3aWR0aDogd2lkdGhcbiAgICBoZWlnaHQ6IGhlaWdodFxuICAgIGRyYXc6IC0+XG4gICAgICB4ID0gMFxuICAgICAgYm94ZXMuZm9yRWFjaCAoYikgLT5cbiAgICAgICAgd2l0aF9ncmFwaGljc19jb250ZXh0IChjdHgpIC0+XG4gICAgICAgICAgY3R4LnRyYW5zbGF0ZSB4LCAwXG4gICAgICAgICAgYi5kcmF3PyhjdHgpXG4gICAgICAgIGlmIGIud2lkdGggPT0gSW5maW5pdHlcbiAgICAgICAgICB4ICs9ICh3aWR0aCAtICh3aWR0aCBmb3Ige3dpZHRofSBpbiBib3hlcyB3aGVuIHdpZHRoICE9IEluZmluaXR5KS5yZWR1Y2UgKGEsIGIpIC0+IGEgKyBiKSAvIHNwcmluZ19jb3VudFxuICAgICAgICBlbHNlXG4gICAgICAgICAgeCArPSBiLndpZHRoXG5cbm92ZXJsYXkgPSAoYm94ZXMuLi4pIC0+XG4gIGJveFxuICAgIHdpZHRoOiBNYXRoLm1heCBfLnBsdWNrKGJveGVzLCAnd2lkdGgnKS4uLlxuICAgIGhlaWdodDogTWF0aC5tYXggXy5wbHVjayhib3hlcywgJ2hlaWdodCcpLi4uXG4gICAgZHJhdzogLT5cbiAgICAgIGZvciBiIGluIGJveGVzXG4gICAgICAgIHdpdGhfZ3JhcGhpY3NfY29udGV4dCAoY3R4KSAtPlxuICAgICAgICAgIGIuZHJhdyBjdHhcblxubGFiZWxlZCA9ICh0ZXh0LCBvcHRpb25zLCBib3gpIC0+XG4gIFtvcHRpb25zLCBib3hdID0gW3t9LCBvcHRpb25zXSBpZiBhcmd1bWVudHMubGVuZ3RoID09IDJcbiAgZGVmYXVsdF9vcHRpb25zID1cbiAgICBmb250OiAnMTJweCBUaW1lcydcbiAgICBmaWxsU3R5bGU6ICdibGFjaydcbiAgb3B0aW9ucyA9IF8uZXh0ZW5kIGRlZmF1bHRfb3B0aW9ucywgb3B0aW9uc1xuICBhYm92ZSB0ZXh0X2JveCh0ZXh0LCBvcHRpb25zKSwgYm94LCBvcHRpb25zXG5cbndpdGhfZ3JpZF9ib3hlcyA9IChvcHRpb25zLCBnZW5lcmF0b3IpIC0+XG4gIHttYXgsIGZsb29yfSA9IE1hdGhcblxuICBvcHRpb25zID0gXy5leHRlbmQge2hlYWRlcl9oZWlnaHQ6IDAsIGd1dHRlcl93aWR0aDogMTAsIGd1dHRlcl9oZWlnaHQ6IDEwfSwgb3B0aW9uc1xuICBjb250YWluZXJfc2l6ZSA9IEN1cnJlbnRCb29rPy5wYWdlX29wdGlvbnMgb3IgQ3VycmVudFBhZ2VcblxuICBsaW5lX2JyZWFrID0ge3dpZHRoOiAwLCBoZWlnaHQ6IDAsIGxpbmVicmVhazogdHJ1ZX1cbiAgaGVhZGVyID0gbnVsbFxuICBjZWxscyA9IFtdXG4gIGdlbmVyYXRvclxuICAgIGhlYWRlcjogKGJveCkgLT4gaGVhZGVyID0gYm94XG4gICAgc3RhcnRfcm93OiAoKSAtPiBjZWxscy5wdXNoIGxpbmVfYnJlYWtcbiAgICBjZWxsOiAoYm94KSAtPiBjZWxscy5wdXNoIGJveFxuICAgIGNlbGxzOiAoYm94ZXMpIC0+IGNlbGxzLnB1c2ggYiBmb3IgYiBpbiBib3hlc1xuXG4gIGNlbGxfd2lkdGggPSBtYXggXy5wbHVjayhjZWxscywgJ3dpZHRoJykuLi5cbiAgY2VsbF9oZWlnaHQgPSBtYXggXy5wbHVjayhjZWxscywgJ2hlaWdodCcpLi4uXG4gICMgY2VsbC5kZXNjZW50ID89IDAgZm9yIGNlbGwgaW4gY2VsbHNcblxuICBfLmV4dGVuZCBvcHRpb25zXG4gICAgLCBoZWFkZXJfaGVpZ2h0OiBoZWFkZXI/LmhlaWdodCBvciAwXG4gICAgLCBjZWxsX3dpZHRoOiBjZWxsX3dpZHRoXG4gICAgLCBjZWxsX2hlaWdodDogY2VsbF9oZWlnaHRcbiAgICAsIGNvbHM6IG1heCAxLCBmbG9vcigoY29udGFpbmVyX3NpemUud2lkdGggKyBvcHRpb25zLmd1dHRlcl93aWR0aCkgLyAoY2VsbF93aWR0aCArIG9wdGlvbnMuZ3V0dGVyX3dpZHRoKSlcbiAgb3B0aW9ucy5yb3dzID0gZG8gLT5cbiAgICBjb250ZW50X2hlaWdodCA9IGNvbnRhaW5lcl9zaXplLmhlaWdodCAtIG9wdGlvbnMuaGVhZGVyX2hlaWdodFxuICAgIGNlbGxfaGVpZ2h0ID0gY2VsbF9oZWlnaHQgKyBvcHRpb25zLmd1dHRlcl9oZWlnaHRcbiAgICBtYXggMSwgZmxvb3IoKGNvbnRlbnRfaGVpZ2h0ICsgb3B0aW9ucy5ndXR0ZXJfaGVpZ2h0KSAvIGNlbGxfaGVpZ2h0KVxuXG4gIGNlbGwuZGVzY2VudCA/PSAwIGZvciBjZWxsIGluIGNlbGxzXG4gIG1heF9kZXNjZW50ID0gbWF4IF8ucGx1Y2soY2VsbHMsICdkZXNjZW50JykuLi5cbiAgIyBjb25zb2xlLmluZm8gJ2Rlc2NlbnQnLCBtYXhfZGVzY2VudCwgJ2Zyb20nLCBfLnBsdWNrKGNlbGxzLCAnZGVzY2VudCcpXG5cbiAgd2l0aF9ncmlkIG9wdGlvbnMsIChncmlkKSAtPlxuICAgIGlmIGhlYWRlclxuICAgICAgd2l0aF9ncmFwaGljc19jb250ZXh0IChjdHgpIC0+XG4gICAgICAgIGN0eC50cmFuc2xhdGUgMCwgaGVhZGVyLmhlaWdodCAtIGhlYWRlci5kZXNjZW50XG4gICAgICAgIGhlYWRlcj8uZHJhdyBjdHhcbiAgICBjZWxscy5mb3JFYWNoIChjZWxsKSAtPlxuICAgICAgZ3JpZC5zdGFydF9yb3coKSBpZiBjZWxsLmxpbmVicmVhaz9cbiAgICAgIHJldHVybiBpZiBjZWxsID09IGxpbmVfYnJlYWtcbiAgICAgIGdyaWQuYWRkX2NlbGwgLT5cbiAgICAgICAgd2l0aF9ncmFwaGljc19jb250ZXh0IChjdHgpIC0+XG4gICAgICAgICAgY3R4LnRyYW5zbGF0ZSAwLCBjZWxsX2hlaWdodCAtIGNlbGwuZGVzY2VudFxuICAgICAgICAgIGNlbGwuZHJhdyBjdHhcblxuXG4jXG4jIEZpbGUgU2F2aW5nXG4jXG5cbkJ1aWxkRGlyZWN0b3J5ID0gJy4nXG5EZWZhdWx0RmlsZW5hbWUgPSBudWxsXG5cbmRpcmVjdG9yeSA9IChwYXRoKSAtPiBCdWlsZERpcmVjdG9yeSA9IHBhdGhcbmZpbGVuYW1lID0gKG5hbWUpIC0+IERlZmF1bHRGaWxlbmFtZSA9IG5hbWVcblxuc2F2ZV9jYW52YXNfdG9fcG5nID0gKGNhbnZhcywgZm5hbWUpIC0+XG4gIG91dCA9IGZzLmNyZWF0ZVdyaXRlU3RyZWFtKHBhdGguam9pbihCdWlsZERpcmVjdG9yeSwgZm5hbWUpKVxuICBzdHJlYW0gPSBjYW52YXMucG5nU3RyZWFtKClcbiAgc3RyZWFtLm9uICdkYXRhJywgKGNodW5rKSAtPiBvdXQud3JpdGUoY2h1bmspXG4gIHN0cmVhbS5vbiAnZW5kJywgKCkgLT4gY29uc29sZS5pbmZvIFwiU2F2ZWQgI3tmbmFtZX1cIlxuXG5cbiNcbiMgUGFwZXIgU2l6ZXNcbiNcblxuUGFwZXJTaXplcyA9XG4gIGZvbGlvOiAnMTJpbiB4IDE1aW4nXG4gIHF1YXJ0bzogJzkuNWluIHggMTJpbidcbiAgb2N0YXZvOiAnNmluIHggOWluJ1xuICBkdW9kZWNpbW86ICc1aW4geCA3LjM3NWluJ1xuICAjIEFOU0kgc2l6ZXNcbiAgJ0FOU0kgQSc6ICc4LjVpbiDDlyAxMWluJ1xuICAnQU5TSSBCJzogJzExaW4geCAxN2luJ1xuICBsZXR0ZXI6ICdBTlNJIEEnXG4gIGxlZGdlcjogJ0FOU0kgQiBsYW5kc2NhcGUnXG4gIHRhYmxvaWQ6ICdBTlNJIEIgcG9ydHJhaXQnXG4gICdBTlNJIEMnOiAnMTdpbiDDlyAyMmluJ1xuICAnQU5TSSBEJzogJzIyaW4gw5cgMzRpbidcbiAgJ0FOU0kgRSc6ICczNGluIMOXIDQ0aW4nXG5cbmdldF9wYWdlX3NpemVfZGltZW5zaW9ucyA9IChzaXplLCBvcmllbnRhdGlvbj1udWxsKSAtPlxuICBwYXJzZU1lYXN1cmUgPSAobWVhc3VyZSkgLT5cbiAgICByZXR1cm4gbWVhc3VyZSBpZiB0eXBlb2YgbWVhc3VyZSA9PSAnbnVtYmVyJ1xuICAgIHVubGVzcyBtZWFzdXJlLm1hdGNoIC9eKFxcZCsoPzpcXC5cXGQqKT8pXFxzKiguKykkL1xuICAgICAgdGhyb3cgbmV3IEVycm9yIFwiVW5yZWNvZ25pemVkIG1lYXN1cmUgI3t1dGlsLmluc3BlY3QgbWVhc3VyZX0gaW4gI3t1dGlsLmluc3BlY3Qgc2l6ZX1cIlxuICAgIFtuLCB1bml0c10gPSBbTnVtYmVyKFJlZ0V4cC4kMSksIFJlZ0V4cC4kMl1cbiAgICBzd2l0Y2ggdW5pdHNcbiAgICAgIHdoZW4gXCJcIiB0aGVuIG5cbiAgICAgIHdoZW4gXCJpblwiIHRoZW4gbiAqIDcyXG4gICAgICBlbHNlIHRocm93IG5ldyBFcnJvciBcIlVucmVjb2duaXplZCB1bml0cyAje3V0aWwuaW5zcGVjdCB1bml0c30gaW4gI3t1dGlsLmluc3BlY3Qgc2l6ZX1cIlxuXG4gIHt3aWR0aCwgaGVpZ2h0fSA9IHNpemVcbiAgd2hpbGUgXy5pc1N0cmluZyhzaXplKVxuICAgIFtzaXplLCBvcmllbnRhdGlvbl0gPSBbUmVnRXhwLiQxLCBSZWdFeHAuUjJdIGlmIHNpemUubWF0Y2ggL14oLispXFxzKyhsYW5kc2NhcGV8cG9ydHJhaXQpJC9cbiAgICBicmVhayB1bmxlc3Mgc2l6ZSBvZiBQYXBlclNpemVzXG4gICAgc2l6ZSA9IFBhcGVyU2l6ZXNbc2l6ZV1cbiAgICB7d2lkdGgsIGhlaWdodH0gPSBzaXplXG4gIGlmIF8uaXNTdHJpbmcoc2l6ZSlcbiAgICB0aHJvdyBuZXcgRXJyb3IgXCJVbnJlY29nbml6ZWQgYm9vayBzaXplIGZvcm1hdCAje3V0aWwuaW5zcGVjdCBzaXplfVwiIHVubGVzcyBzaXplLm1hdGNoIC9eKC4rPylcXHMqW3jDl11cXHMqKC4rKSQvXG4gICAgW3dpZHRoLCBoZWlnaHRdID0gW1JlZ0V4cC4kMSwgUmVnRXhwLiQyXVxuXG4gIFt3aWR0aCwgaGVpZ2h0XSA9IFtwYXJzZU1lYXN1cmUod2lkdGgpLCBwYXJzZU1lYXN1cmUoaGVpZ2h0KV1cbiAgc3dpdGNoIG9yaWVudGF0aW9uIG9yICcnXG4gICAgd2hlbiAnbGFuZHNjYXBlJyB0aGVuIFt3aWR0aCwgaGVpZ2h0XSA9IFtoZWlnaHQsIHdpZHRoXSB1bmxlc3Mgd2lkdGggPiBoZWlnaHRcbiAgICB3aGVuICdwb3J0cmFpdCcgdGhlbiBbd2lkdGgsIGhlaWdodF0gPSBbaGVpZ2h0LCB3aWR0aF0gaWYgd2lkdGggPiBoZWlnaHRcbiAgICB3aGVuICcnIHRoZW4gbnVsbFxuICAgIGVsc2UgdGhyb3cgbmV3IEVycm9yIFwiVW5rbm93biBvcmllbnRhdGlvbiAje3V0aWwuaW5zcGVjdCBvcmllbnRhdGlvbn1cIlxuICB7d2lkdGgsIGhlaWdodH1cblxuZG8gLT5cbiAgZm9yIG5hbWUsIHZhbHVlIG9mIFBhcGVyU2l6ZXNcbiAgICBQYXBlclNpemVzW25hbWVdID0gZ2V0X3BhZ2Vfc2l6ZV9kaW1lbnNpb25zIHZhbHVlXG5cblxuI1xuIyBMYXlvdXRcbiNcblxuQ3VycmVudFBhZ2UgPSBudWxsXG5DdXJyZW50Qm9vayA9IG51bGxcbk1vZGUgPSBudWxsXG5cbl8ubWl4aW5cbiAgc3VtOlxuICAgIGRvIChwbHVzPShhLGIpIC0+IGErYikgLT5cbiAgICAgICh4cykgLT4gXy5yZWR1Y2UoeHMsIHBsdXMsIDApXG5cblRETFJMYXlvdXQgPSAoYm94ZXMpIC0+XG4gIHBhZ2Vfd2lkdGggPSBDdXJyZW50UGFnZS53aWR0aCAtIEN1cnJlbnRQYWdlLmxlZnRfbWFyZ2luIC0gQ3VycmVudFBhZ2UudG9wX21hcmdpblxuICBib3hlcyA9IGJveGVzWy4uXVxuICBiLmRlc2NlbnQgPz0gMCBmb3IgYiBpbiBib3hlc1xuICBkeSA9IDBcbiAgd2lkdGggPSAwXG4gIHdoaWxlIGJveGVzLmxlbmd0aFxuICAgIGNvbnNvbGUuaW5mbyAnbmV4dCcsIGJveGVzLmxlbmd0aFxuICAgIGxpbmUgPSBbXVxuICAgIHdoaWxlIGJveGVzLmxlbmd0aFxuICAgICAgYiA9IGJveGVzWzBdXG4gICAgICBicmVhayBpZiB3aWR0aCArIGIud2lkdGggPiBwYWdlX3dpZHRoIGFuZCBsaW5lLmxlbmd0aCA+IDBcbiAgICAgIGxpbmUucHVzaCBiXG4gICAgICBib3hlcy5zaGlmdCgpXG4gICAgICB3aWR0aCArPSBiLndpZHRoXG4gICAgYXNjZW50ID0gXy5tYXgoYi5oZWlnaHQgLSBiLmRlc2NlbnQgZm9yIGIgaW4gbGluZSlcbiAgICBkZXNjZW50ID0gXy5jaGFpbihsaW5lKS5wbHVjaygnZGVzY2VudCcpLm1heCgpXG4gICAgZHggPSAwXG4gICAgY29uc29sZS5pbmZvICdkcmF3JywgbGluZS5sZW5ndGhcbiAgICBmb3IgYiBpbiBsaW5lXG4gICAgICB3aXRoX2dyYXBoaWNzX2NvbnRleHQgKGN0eCkgLT5cbiAgICAgICAgY3R4LnRyYW5zbGF0ZSBkeCwgZHkgKyBhc2NlbnRcbiAgICAgICAgY29uc29sZS5pbmZvICdkcmF3JywgZHgsIGR5ICsgYXNjZW50LCBiLmRyYXdcbiAgICAgICAgYi5kcmF3IGN0eFxuICAgICAgZHggKz0gYi53aWR0aFxuICAgIGR5ICs9IGFzY2VudCArIGRlc2NlbnRcblxud2l0aF9wYWdlID0gKG9wdGlvbnMsIGRyYXdfcGFnZSkgLT5cbiAgdGhyb3cgbmV3IEVycm9yIFwiQWxyZWFkeSBpbnNpZGUgYSBwYWdlXCIgaWYgQ3VycmVudFBhZ2VcbiAgZGVmYXVsdHMgPSB7d2lkdGg6IDEwMCwgaGVpZ2h0OiAxMDAsIHBhZ2VfbWFyZ2luOiAxMH1cbiAge3dpZHRoLCBoZWlnaHQsIHBhZ2VfbWFyZ2lufSA9IF8uZXh0ZW5kIGRlZmF1bHRzLCBvcHRpb25zXG4gIHtsZWZ0X21hcmdpbiwgdG9wX21hcmdpbiwgcmlnaHRfbWFyZ2luLCBib3R0b21fbWFyZ2lufSA9IG9wdGlvbnNcbiAgbGVmdF9tYXJnaW4gPz0gcGFnZV9tYXJnaW5cbiAgdG9wX21hcmdpbiA/PSBwYWdlX21hcmdpblxuICByaWdodF9tYXJnaW4gPz0gcGFnZV9tYXJnaW5cbiAgYm90dG9tX21hcmdpbiA/PSBwYWdlX21hcmdpblxuXG4gIGNhbnZhcyA9IENvbnRleHQuY2FudmFzIHx8PVxuICAgIG5ldyBDYW52YXMgd2lkdGggKyBsZWZ0X21hcmdpbiArIHJpZ2h0X21hcmdpbiwgaGVpZ2h0ICsgdG9wX21hcmdpbiArIGJvdHRvbV9tYXJnaW4sIE1vZGVcbiAgY3R4ID0gQ29udGV4dC5jdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKVxuICBjdHgudGV4dERyYXdpbmdNb2RlID0gJ2dseXBoJyBpZiBNb2RlID09ICdwZGYnXG4gIGJveGVzID0gW11cblxuICB0cnlcbiAgICBwYWdlID1cbiAgICAgIGxlZnRfbWFyZ2luOiBsZWZ0X21hcmdpblxuICAgICAgdG9wX21hcmdpbjogdG9wX21hcmdpblxuICAgICAgcmlnaHRfbWFyZ2luOiByaWdodF9tYXJnaW5cbiAgICAgIGJvdHRvbV9tYXJnaW46IGJvdHRvbV9tYXJnaW5cbiAgICAgIHdpZHRoOiBjYW52YXMud2lkdGhcbiAgICAgIGhlaWdodDogY2FudmFzLmhlaWdodFxuICAgICAgY29udGV4dDogY3R4XG4gICAgICBib3g6IChvcHRpb25zKSAtPlxuICAgICAgICBib3hlcy5wdXNoIGJveChvcHRpb25zKVxuICAgIEN1cnJlbnRQYWdlID0gcGFnZVxuXG4gICAgZXJhc2VfYmFja2dyb3VuZCgpXG5cbiAgICB3aXRoX2dyYXBoaWNzX2NvbnRleHQgKGN0eCkgLT5cbiAgICAgIGN0eC50cmFuc2xhdGUgbGVmdF9tYXJnaW4sIGJvdHRvbV9tYXJnaW5cbiAgICAgIEN1cnJlbnRCb29rPy5oZWFkZXI/IHBhZ2VcbiAgICAgIEN1cnJlbnRCb29rPy5mb290ZXI/IHBhZ2VcbiAgICAgIGRyYXdfcGFnZT8gcGFnZVxuICAgICAgVERMUkxheW91dCBib3hlc1xuXG4gICAgc3dpdGNoIE1vZGVcbiAgICAgIHdoZW4gJ3BkZicgdGhlbiBjdHguYWRkUGFnZSgpXG4gICAgICBlbHNlXG4gICAgICAgIGZpbGVuYW1lID0gXCIje0RlZmF1bHRGaWxlbmFtZSBvciAndGVzdCd9LnBuZ1wiXG4gICAgICAgIGZzLndyaXRlRmlsZSBwYXRoLmpvaW4oQnVpbGREaXJlY3RvcnksIGZpbGVuYW1lKSwgY2FudmFzLnRvQnVmZmVyKClcbiAgICAgICAgY29uc29sZS5pbmZvIFwiU2F2ZWQgI3tmaWxlbmFtZX1cIlxuICBmaW5hbGx5XG4gICAgQ3VycmVudFBhZ2UgPSBudWxsXG5cbndpdGhfZ3JpZCA9IChvcHRpb25zLCBjYikgLT5cbiAgZGVmYXVsdHMgPSB7Z3V0dGVyX3dpZHRoOiAxMCwgZ3V0dGVyX2hlaWdodDogMTAsIGhlYWRlcl9oZWlnaHQ6IDB9XG4gIG9wdGlvbnMgPSBfLmV4dGVuZCBkZWZhdWx0cywgb3B0aW9uc1xuICB7Y29scywgcm93cywgY2VsbF93aWR0aCwgY2VsbF9oZWlnaHQsIGhlYWRlcl9oZWlnaHQsIGd1dHRlcl93aWR0aCwgZ3V0dGVyX2hlaWdodH0gPSBvcHRpb25zXG4gIG9wdGlvbnMud2lkdGggfHw9IGNvbHMgKiBjZWxsX3dpZHRoICsgKGNvbHMgLSAxKSAqIGd1dHRlcl93aWR0aFxuICBvcHRpb25zLmhlaWdodCB8fD0gIGhlYWRlcl9oZWlnaHQgKyByb3dzICogY2VsbF9oZWlnaHQgKyAocm93cyAtIDEpICogZ3V0dGVyX2hlaWdodFxuICBvdmVyZmxvdyA9IFtdXG4gIHdpdGhfcGFnZSBvcHRpb25zLCAocGFnZSkgLT5cbiAgICBjYlxuICAgICAgY29udGV4dDogcGFnZS5jb250ZXh0XG4gICAgICByb3dzOiByb3dzXG4gICAgICBjb2xzOiBjb2xzXG4gICAgICByb3c6IDBcbiAgICAgIGNvbDogMFxuICAgICAgYWRkX2NlbGw6IChkcmF3X2ZuKSAtPlxuICAgICAgICBbY29sLCByb3ddID0gW0Bjb2wsIEByb3ddXG4gICAgICAgIGlmIHJvdyA+PSByb3dzXG4gICAgICAgICAgb3ZlcmZsb3cucHVzaCB7Y29sLCByb3csIGRyYXdfZm59XG4gICAgICAgIGVsc2VcbiAgICAgICAgICB3aXRoX2dyYXBoaWNzX2NvbnRleHQgKGN0eCkgLT5cbiAgICAgICAgICAgIGN0eC50cmFuc2xhdGUgY29sICogKGNlbGxfd2lkdGggKyBndXR0ZXJfd2lkdGgpLCBoZWFkZXJfaGVpZ2h0ICsgcm93ICogKGNlbGxfaGVpZ2h0ICsgZ3V0dGVyX2hlaWdodClcbiAgICAgICAgICAgIGRyYXdfZm4oKVxuICAgICAgICBjb2wgKz0gMVxuICAgICAgICBbY29sLCByb3ddID0gWzAsIHJvdyArIDFdIGlmIGNvbCA+PSBjb2xzXG4gICAgICAgIFtAY29sLCBAcm93XSA9IFtjb2wsIHJvd11cbiAgICAgIHN0YXJ0X3JvdzogLT5cbiAgICAgICAgW0Bjb2wsIEByb3ddID0gWzAsIEByb3cgKyAxXSBpZiBAY29sID4gMFxuICB3aGlsZSBvdmVyZmxvdy5sZW5ndGhcbiAgICBjZWxsLnJvdyAtPSByb3dzIGZvciBjZWxsIGluIG92ZXJmbG93XG4gICAgd2l0aF9wYWdlIG9wdGlvbnMsIChwYWdlKSAtPlxuICAgICAgZm9yIHtjb2wsIHJvdywgZHJhd19mbn0gaW4gXy5zZWxlY3Qob3ZlcmZsb3csIChjZWxsKSAtPiBjZWxsLnJvdyA8IHJvd3MpXG4gICAgICAgIHdpdGhfZ3JhcGhpY3NfY29udGV4dCAoY3R4KSAtPlxuICAgICAgICAgIGN0eC50cmFuc2xhdGUgY29sICogKGNlbGxfd2lkdGggKyBndXR0ZXJfd2lkdGgpLCBoZWFkZXJfaGVpZ2h0ICsgcm93ICogKGNlbGxfaGVpZ2h0ICsgZ3V0dGVyX2hlaWdodClcbiAgICAgICAgICBkcmF3X2ZuKClcbiAgICBvdmVyZmxvdyA9IChjZWxsIGZvciBjZWxsIGluIG92ZXJmbG93IHdoZW4gY2VsbC5yb3cgPj0gcm93cylcblxud2l0aF9ib29rID0gKGZpbGVuYW1lLCBvcHRpb25zLCBjYikgLT5cbiAgdGhyb3cgbmV3IEVycm9yIFwid2l0aF9ib29rIGNhbGxlZCByZWN1cnNpdmVseVwiIGlmIEN1cnJlbnRCb29rXG4gIFtvcHRpb25zLCBjYl0gPSBbe30sIG9wdGlvbnNdIGlmIF8uaXNGdW5jdGlvbihvcHRpb25zKVxuICBwYWdlX2xpbWl0ID0gb3B0aW9ucy5wYWdlX2xpbWl0XG4gIHBhZ2VfY291bnQgPSAwXG5cbiAgdHJ5XG4gICAgYm9vayA9XG4gICAgICBwYWdlX29wdGlvbnM6IHt9XG5cbiAgICBNb2RlID0gJ3BkZidcbiAgICBDdXJyZW50Qm9vayA9IGJvb2tcblxuICAgIHNpemUgPSBvcHRpb25zLnNpemVcbiAgICBpZiBzaXplXG4gICAgICB7d2lkdGgsIGhlaWdodH0gPSBnZXRfcGFnZV9zaXplX2RpbWVuc2lvbnMgc2l6ZVxuICAgICAgXy5leHRlbmQgYm9vay5wYWdlX29wdGlvbnMsIHt3aWR0aCwgaGVpZ2h0fVxuICAgICAgY2FudmFzID0gQ29udGV4dC5jYW52YXMgfHw9IG5ldyBDYW52YXMgd2lkdGgsIGhlaWdodCwgTW9kZVxuICAgICAgY3R4ID0gQ29udGV4dC5jdHggPSBjYW52YXMuZ2V0Q29udGV4dCAnMmQnXG4gICAgICBjdHgudGV4dERyYXdpbmdNb2RlID0gJ2dseXBoJyBpZiBNb2RlID09ICdwZGYnXG5cbiAgICBjYlxuICAgICAgcGFnZV9oZWFkZXI6IChoZWFkZXIpIC0+IGJvb2suaGVhZGVyID0gaGVhZGVyXG4gICAgICBwYWdlX2Zvb3RlcjogKGZvb3RlcikgLT4gYm9vay5mb290ZXIgPSBmb290ZXJcbiAgICAgIHdpdGhfcGFnZTogKG9wdGlvbnMsIGRyYXdfcGFnZSkgLT5cbiAgICAgICAgW29wdGlvbnMsIGRyYXdfcGFnZV0gPSBbe30sIG9wdGlvbnNdIGlmIF8uaXNGdW5jdGlvbihvcHRpb25zKVxuICAgICAgICByZXR1cm4gaWYgQGRvbmVcbiAgICAgICAgb3B0aW9ucyA9IF8uZXh0ZW5kIHt9LCBib29rLnBhZ2Vfb3B0aW9ucywgb3B0aW9uc1xuICAgICAgICBwYWdlX2NvdW50ICs9IDFcbiAgICAgICAgaWYgQ3VycmVudFBhZ2VcbiAgICAgICAgICBkcmF3X3BhZ2UgQ3VycmVudFBhZ2VcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHdpdGhfcGFnZSBvcHRpb25zLCBkcmF3X3BhZ2VcbiAgICAgICAgQGRvbmUgPSB0cnVlIGlmIHBhZ2VfbGltaXQgYW5kIHBhZ2VfbGltaXQgPD0gcGFnZV9jb3VudFxuXG4gICAgaWYgY2FudmFzXG4gICAgICB3cml0ZV9wZGYgY2FudmFzLCBwYXRoLmpvaW4oQnVpbGREaXJlY3RvcnksIFwiI3tmaWxlbmFtZX0ucGRmXCIpXG4gICAgZWxzZVxuICAgICAgY29uc29sZS53YXJuIFwiTm8gcGFnZXNcIlxuICBmaW5hbGx5XG4gICAgQ3VycmVudEJvb2sgPSBudWxsXG4gICAgTW9kZSA9IG51bGxcbiAgICBjYW52YXMgPSBudWxsXG4gICAgY3R4ID0gbnVsbFxuXG53cml0ZV9wZGYgPSAoY2FudmFzLCBwYXRobmFtZSkgLT5cbiAgZnMud3JpdGVGaWxlIHBhdGhuYW1lLCBjYW52YXMudG9CdWZmZXIoKSwgKGVycikgLT5cbiAgICBpZiBlcnJcbiAgICAgIGNvbnNvbGUuZXJyb3IgXCJFcnJvciAje2Vyci5jb2RlfSB3cml0aW5nIHRvICN7ZXJyLnBhdGh9XCJcbiAgICBlbHNlXG4gICAgICBjb25zb2xlLmluZm8gXCJTYXZlZCAje3BhdGhuYW1lfVwiXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBQYXBlclNpemVzXG4gIGFib3ZlXG4gIHdpdGhfYm9va1xuICB3aXRoX2dyaWRcbiAgd2l0aF9ncmlkX2JveGVzXG4gIHdpdGhfcGFnZVxuICBkcmF3X3RleHRcbiAgYm94XG4gIGhib3hcbiAgcGFkX2JveFxuICB0ZXh0X2JveFxuICBsYWJlbGVkXG4gIG1lYXN1cmVfdGV4dFxuICBkaXJlY3RvcnlcbiAgZmlsZW5hbWVcbiAgd2l0aF9ncmFwaGljc19jb250ZXh0XG4gIHdpdGhDYW52YXM6IHdpdGhfY2FudmFzXG59XG4iLCJ7UEksIGNvcywgc2luLCBtaW4sIG1heH0gPSBNYXRoXG5DaG9yZERpYWdyYW1TdHlsZSA9IHJlcXVpcmUoJy4vY2hvcmRfZGlhZ3JhbScpLmRlZmF1bHRTdHlsZVxue2Jsb2NrLCB3aXRoX2dyYXBoaWNzX2NvbnRleHR9ID0gcmVxdWlyZSAnLi9sYXlvdXQnXG5cbmRyYXdfcGl0Y2hfZGlhZ3JhbSA9IChjdHgsIHBpdGNoX2NsYXNzZXMsIG9wdGlvbnM9e2RyYXc6IHRydWV9KSAtPlxuICB7cGl0Y2hfY29sb3JzLCBwaXRjaF9uYW1lc30gPSBvcHRpb25zXG4gIHBpdGNoX2NvbG9ycyB8fD0gQ2hvcmREaWFncmFtU3R5bGUuaW50ZXJ2YWxfY2xhc3NfY29sb3JzXG4gIHBpdGNoX25hbWVzIHx8PSAnUiBtMiBNMiBtMyBNMyBQNCBUVCBQNSBtNiBNNiBtNyBNNycuc3BsaXQoL1xccy8pXG4gICMgcGl0Y2hfbmFtZXMgPSAnMSAyYiAyIDNiIDMgNCBUIDUgNmIgNiA3YiA3Jy5zcGxpdCgvXFxzLylcbiAgciA9IDEwXG4gIHJfbGFiZWwgPSByICsgN1xuXG4gIHBpdGNoX2NsYXNzX2FuZ2xlID0gKHBpdGNoX2NsYXNzKSAtPlxuICAgIChwaXRjaF9jbGFzcyAtIDMpICogMiAqIFBJIC8gMTJcblxuICBib3VuZHMgPSB7bGVmdDogMCwgdG9wOiAwLCByaWdodDogMCwgYm90dG9tOiAwfVxuICBleHRlbmRfYm91bmRzID0gKGxlZnQsIHRvcCwgYm90dG9tLCByaWdodCkgLT5cbiAgICAjIHJpZ2h0ID89IGxlZnRcbiAgICAjIGJvdHRvbSA/PSB0b3BcbiAgICBib3VuZHMubGVmdCA9IG1pbiBib3VuZHMubGVmdCwgbGVmdFxuICAgIGJvdW5kcy50b3AgPSBtaW4gYm91bmRzLnRvcCwgdG9wXG4gICAgYm91bmRzLnJpZ2h0ID0gbWF4IGJvdW5kcy5yaWdodCwgcmlnaHQgPyBsZWZ0XG4gICAgYm91bmRzLmJvdHRvbSA9IG1heCBib3VuZHMuYm90dG9tLCBib3R0b20gPyB0b3BcblxuICBmb3IgcGl0Y2hfY2xhc3MgaW4gcGl0Y2hfY2xhc3Nlc1xuICAgIGFuZ2xlID0gcGl0Y2hfY2xhc3NfYW5nbGUgcGl0Y2hfY2xhc3NcbiAgICB4ID0gciAqIGNvcyhhbmdsZSlcbiAgICB5ID0gciAqIHNpbihhbmdsZSlcblxuICAgIGlmIG9wdGlvbnMuZHJhd1xuICAgICAgY3R4LmJlZ2luUGF0aCgpXG4gICAgICBjdHgubW92ZVRvIDAsIDBcbiAgICAgIGN0eC5saW5lVG8geCwgeVxuICAgICAgY3R4LnN0cm9rZSgpXG4gICAgZXh0ZW5kX2JvdW5kcyB4LCB5XG5cbiAgICBpZiBvcHRpb25zLmRyYXdcbiAgICAgIGN0eC5iZWdpblBhdGgoKVxuICAgICAgY3R4LmFyYyB4LCB5LCAyLCAwLCAyICogUEksIGZhbHNlXG4gICAgICBjdHguZmlsbFN0eWxlID0gcGl0Y2hfY29sb3JzW3BpdGNoX2NsYXNzXSBvciAnYmxhY2snXG4gICAgICBjdHguZmlsbCgpXG5cbiAgY3R4LmZvbnQgPSAnNHB0IFRpbWVzJ1xuICBjdHguZmlsbFN0eWxlID0gJ2JsYWNrJ1xuICBmb3IgY2xhc3NfbmFtZSwgcGl0Y2hfY2xhc3MgaW4gcGl0Y2hfbmFtZXNcbiAgICBhbmdsZSA9IHBpdGNoX2NsYXNzX2FuZ2xlIHBpdGNoX2NsYXNzXG4gICAgbSA9IGN0eC5tZWFzdXJlVGV4dCBjbGFzc19uYW1lXG4gICAgeCA9IHJfbGFiZWwgKiBjb3MoYW5nbGUpIC0gbS53aWR0aCAvIDJcbiAgICB5ID0gcl9sYWJlbCAqIHNpbihhbmdsZSkgKyBtLmVtSGVpZ2h0RGVzY2VudFxuICAgIGN0eC5maWxsVGV4dCBjbGFzc19uYW1lLCB4LCB5IGlmIG9wdGlvbnMuZHJhd1xuICAgIGJvdW5kcy5sZWZ0ID0gbWluIGJvdW5kcy5sZWZ0LCB4XG4gICAgYm91bmRzLnJpZ2h0ID0gbWF4IGJvdW5kcy5yaWdodCwgeCArIG0ud2lkdGhcbiAgICBib3VuZHMudG9wID0gbWluIGJvdW5kcy50b3AsIHkgLSBtLmVtSGVpZ2h0QXNjZW50XG4gICAgYm91bmRzLmJvdHRvbSA9IG1heCBib3VuZHMuYm90dG9tLCB5ICsgbS5lbUhlaWdodEFzY2VudFxuXG4gIHJldHVybiBib3VuZHNcblxucGl0Y2hfZGlhZ3JhbV9ibG9jayA9IChwaXRjaF9jbGFzc2VzLCBzY2FsZT0xKSAtPlxuICBib3VuZHMgPSB3aXRoX2dyYXBoaWNzX2NvbnRleHQgKGN0eCkgLT4gZHJhd19waXRjaF9kaWFncmFtIGN0eCwgcGl0Y2hfY2xhc3NlcywgZHJhdzogZmFsc2UsIG1lYXN1cmU6IHRydWVcbiAgYmxvY2tcbiAgICB3aWR0aDogKGJvdW5kcy5yaWdodCAtIGJvdW5kcy5sZWZ0KSAqIHNjYWxlXG4gICAgaGVpZ2h0OiAoYm91bmRzLmJvdHRvbSAtIGJvdW5kcy50b3ApICogc2NhbGVcbiAgICBkcmF3OiAtPlxuICAgICAgd2l0aF9ncmFwaGljc19jb250ZXh0IChjdHgpIC0+XG4gICAgICAgIGN0eC5zY2FsZSBzY2FsZSwgc2NhbGVcbiAgICAgICAgY3R4LnRyYW5zbGF0ZSAtYm91bmRzLmxlZnQsIC1ib3VuZHMuYm90dG9tXG4gICAgICAgIGRyYXdfcGl0Y2hfZGlhZ3JhbSBjdHgsIHBpdGNoX2NsYXNzZXNcblxubW9kdWxlLmV4cG9ydHMgPVxuICBkcmF3OiBkcmF3X3BpdGNoX2RpYWdyYW1cbiAgYmxvY2s6IHBpdGNoX2RpYWdyYW1fYmxvY2tcbiIsIiNcbiMgTm90ZXMgYW5kIFBpdGNoZXNcbiNcblxuU2hhcnBOb3RlTmFtZXMgPSAnQyBDIyBEIEQjIEUgRiBGIyBHIEcjIEEgQSMgQicucmVwbGFjZSgvIy9nLCAnXFx1MjY2RicpLnNwbGl0KC9cXHMvKVxuRmxhdE5vdGVOYW1lcyA9ICdDIERiIEQgRWIgRSBGIEdiIEcgQWIgQSBCYiBCJy5yZXBsYWNlKC9iL2csICdcXHUyNjZEJykuc3BsaXQoL1xccy8pXG5Ob3RlTmFtZXMgPSBTaGFycE5vdGVOYW1lcyAgIyBcIkcjIEEgQSMgQiBDIEMjIEQgRCMgRSBGIEYjIEdcIi4gc3BsaXQoL1xccy8pXG5cbkludGVydmFsTmFtZXMgPSBbJ1AxJywgJ20yJywgJ00yJywgJ20zJywgJ00zJywgJ1A0JywgJ1RUJywgJ1A1JywgJ202JywgJ002JywgJ203JywgJ003JywgJ1A4J11cblxuTG9uZ0ludGVydmFsTmFtZXMgPSBbXG4gICdVbmlzb24nLCAnTWlub3IgMm5kJywgJ01ham9yIDJuZCcsICdNaW5vciAzcmQnLCAnTWFqb3IgM3JkJywgJ1BlcmZlY3QgNHRoJyxcbiAgJ1RyaXRvbmUnLCAnUGVyZmVjdCA1dGgnLCAnTWlub3IgNnRoJywgJ01ham9yIDZ0aCcsICdNaW5vciA3dGgnLCAnTWFqb3IgN3RoJywgJ09jdGF2ZSddXG5cbiMgVGhlIGludGVydmFsIGNsYXNzIChpbnRlZ2VyIGluIFswLi4uMTJdKSBiZXR3ZWVuIHR3byBwaXRjaCBjbGFzcyBudW1iZXJzXG5pbnRlcnZhbF9jbGFzc19iZXR3ZWVuID0gKHBjYSwgcGNiKSAtPlxuICBuID0gKHBjYiAtIHBjYSkgJSAxMlxuICBuICs9IDEyIHdoaWxlIG4gPCAwXG4gIHJldHVybiBuXG5cblxuI1xuIyBTY2FsZXNcbiNcblxuY2xhc3MgU2NhbGVcbiAgY29uc3RydWN0b3I6ICh7QG5hbWUsIEBwaXRjaGVzLCBAdG9uaWNOYW1lfSkgLT5cblxuICBjaG9yZHM6IC0+XG4gICAgdG9uaWNQaXRjaCA9IE5vdGVOYW1lcy5pbmRleE9mKEB0b25pY05hbWUpXG4gICAgZm9yIGkgaW4gWzAuLi5AcGl0Y2hlcy5sZW5ndGhdXG4gICAgICBwaXRjaGVzID0gQHBpdGNoZXNbaS4uXS5jb25jYXQoQHBpdGNoZXNbLi4uaV0pXG4gICAgICBwaXRjaGVzID0gW3BpdGNoZXNbMF0sIHBpdGNoZXNbMl0sIHBpdGNoZXNbNF1dLm1hcCAobikgLT4gKG4gKyB0b25pY1BpdGNoKSAlIDEyXG4gICAgICBDaG9yZC5mcm9tUGl0Y2hlcyhwaXRjaGVzKVxuXG4gIGF0OiAodG9uaWNOYW1lKSAtPlxuICAgIG5ldyBTY2FsZVxuICAgICAgbmFtZTogQG5hbWVcbiAgICAgIHBpdGNoZXM6IEBwaXRjaGVzXG4gICAgICB0b25pY05hbWU6IHRvbmljTmFtZVxuXG4gIEBmaW5kOiAodG9uaWNOYW1lKSAtPlxuICAgIHNjYWxlTmFtZSA9ICdEaWF0b25pYyBNYWpvcidcbiAgICBTY2FsZXNbc2NhbGVOYW1lXS5hdCh0b25pY05hbWUpXG5cblNjYWxlcyA9IGRvIC0+XG4gIHNjYWxlX3NwZWNzID0gW1xuICAgICdEaWF0b25pYyBNYWpvcjogMDI0NTc5ZSdcbiAgICAnTmF0dXJhbCBNaW5vcjogMDIzNTc4dCdcbiAgICAnTWVsb2RpYyBNaW5vcjogMDIzNTc5ZSdcbiAgICAnSGFybW9uaWMgTWlub3I6IDAyMzU3OGUnXG4gICAgJ1BlbnRhdG9uaWMgTWFqb3I6IDAyNDc5J1xuICAgICdQZW50YXRvbmljIE1pbm9yOiAwMzU3dCdcbiAgICAnQmx1ZXM6IDAzNTY3dCdcbiAgICAnRnJleWdpc2g6IDAxNDU3OHQnXG4gICAgJ1dob2xlIFRvbmU6IDAyNDY4dCdcbiAgICAjICdPY3RhdG9uaWMnIGlzIHRoZSBjbGFzc2ljYWwgbmFtZS4gSXQncyB0aGUgamF6eiAnRGltaW5pc2hlZCcgc2NhbGUuXG4gICAgJ09jdGF0b25pYzogMDIzNTY4OWUnXG4gIF1cbiAgZm9yIHNwZWMgaW4gc2NhbGVfc3BlY3NcbiAgICBbbmFtZSwgcGl0Y2hlc10gPSBzcGVjLnNwbGl0KC86XFxzKi8sIDIpXG4gICAgcGl0Y2hlcyA9IHBpdGNoZXMubWF0Y2goLy4vZykubWFwIChjKSAtPiB7J3QnOjEwLCAnZSc6MTF9W2NdIG9yIE51bWJlcihjKVxuICAgIG5ldyBTY2FsZSB7bmFtZSwgcGl0Y2hlc31cblxuZG8gLT5cbiAgU2NhbGVzW3NjYWxlLm5hbWVdID0gc2NhbGUgZm9yIHNjYWxlIGluIFNjYWxlc1xuXG5Nb2RlcyA9IGRvIC0+XG4gIHJvb3RfdG9uZXMgPSBTY2FsZXNbJ0RpYXRvbmljIE1ham9yJ10ucGl0Y2hlc1xuICBtb2RlX25hbWVzID0gJ0lvbmlhbiBEb3JpYW4gUGhyeWdpYW4gTHlkaWFuIE1peG9seWRpYW4gQWVvbGlhbiBMb2NyaWFuJy5zcGxpdCgvXFxzLylcbiAgZm9yIGRlbHRhLCBpIGluIHJvb3RfdG9uZXNcbiAgICBuYW1lID0gbW9kZV9uYW1lc1tpXVxuICAgIHBpdGNoZXMgPSAoKGQgLSBkZWx0YSArIDEyKSAlIDEyIGZvciBkIGluIHJvb3RfdG9uZXNbaS4uLl0uY29uY2F0IHJvb3RfdG9uZXNbLi4uaV0pXG4gICAgbmV3IFNjYWxlIHtuYW1lLCBwaXRjaGVzfVxuXG5kbyAtPlxuICBNb2Rlc1ttb2RlLm5hbWVdID0gbW9kZSBmb3IgbW9kZSBpbiBNb2Rlc1xuXG4jIEluZGV4ZWQgYnkgc2NhbGUgZGVncmVlXG5GdW5jdGlvbnMgPSAnVG9uaWMgU3VwZXJ0b25pYyBNZWRpYW50IFN1YmRvbWluYW50IERvbWluYW50IFN1Ym1lZGlhbnQgU3VidG9uaWMgTGVhZGluZycuc3BsaXQoL1xccy8pXG5cbnBhcnNlQ2hvcmROdW1lcmFsID0gKG5hbWUpIC0+XG4gIGNob3JkID0ge1xuICAgIGRlZ3JlZTogJ2kgaWkgaWlpIGl2IHYgdmkgdmlpJy5pbmRleE9mKG5hbWUubWF0Y2goL1tpditdL2kpWzFdKSArIDFcbiAgICBtYWpvcjogbmFtZSA9PSBuYW1lLnRvVXBwZXJDYXNlKClcbiAgICBmbGF0OiBuYW1lLm1hdGNoKC9eYi8pXG4gICAgZGltaW5pc2hlZDogbmFtZS5tYXRjaCgvwrAvKVxuICAgIGF1Z21lbnRlZDogbmFtZS5tYXRjaCgvXFwrLylcbiAgfVxuICByZXR1cm4gY2hvcmRcblxuRnVuY3Rpb25RdWFsaXRpZXMgPVxuICBtYWpvcjogJ0kgaWkgaWlpIElWIFYgdmkgdmlpwrAnLnNwbGl0KC9cXHMvKS5tYXAgcGFyc2VDaG9yZE51bWVyYWxcbiAgbWlub3I6ICdpIGlpwrAgYklJSSBpdiB2IGJWSSBiVklJJy5zcGxpdCgvXFxzLykubWFwIHBhcnNlQ2hvcmROdW1lcmFsXG5cblxuI1xuIyBDaG9yZHNcbiNcblxuY2xhc3MgQ2hvcmRcbiAgY29uc3RydWN0b3I6IChvcHRpb25zKSAtPlxuICAgIEBuYW1lID0gb3B0aW9ucy5uYW1lXG4gICAgQGZ1bGxfbmFtZSA9IG9wdGlvbnMuZnVsbF9uYW1lXG4gICAgQGFiYnJzID0gb3B0aW9ucy5hYmJycyBvciBbb3B0aW9ucy5hYmJyXVxuICAgIEBhYmJycyA9IEBhYmJycy5zcGxpdCgvcy8pIGlmIHR5cGVvZiBAYWJicnMgPT0gJ3N0cmluZydcbiAgICBAYWJiciA9IG9wdGlvbnMuYWJiciBvciBAYWJicnNbMF1cbiAgICBAcGl0Y2hfY2xhc3NlcyA9IG9wdGlvbnMucGl0Y2hfY2xhc3Nlc1xuICAgIEByb290ID0gb3B0aW9ucy5yb290XG4gICAgQHJvb3QgPSBOb3RlTmFtZXMuaW5kZXhPZiBAcm9vdCBpZiB0eXBlb2YgQHJvb3QgPT0gJ3N0cmluZydcbiAgICBkZWdyZWVzID0gKDEgKyAyICogaSBmb3IgaSBpbiBbMC4uQHBpdGNoX2NsYXNzZXMubGVuZ3RoXSlcbiAgICBkZWdyZWVzWzFdID0geydTdXMyJzoyLCAnU3VzNCc6NH1bQG5hbWVdIHx8IGRlZ3JlZXNbMV1cbiAgICBkZWdyZWVzWzNdID0gNiBpZiBAbmFtZS5tYXRjaCAvNi9cbiAgICBAY29tcG9uZW50cyA9IGZvciBwYywgcGNpIGluIEBwaXRjaF9jbGFzc2VzXG4gICAgICBuYW1lID0gSW50ZXJ2YWxOYW1lc1twY11cbiAgICAgIGRlZ3JlZSA9IGRlZ3JlZXNbcGNpXVxuICAgICAgaWYgcGMgPT0gMFxuICAgICAgICBuYW1lID0gJ1InXG4gICAgICBlbHNlIHVubGVzcyBOdW1iZXIobmFtZS5tYXRjaCgvXFxkKy8pP1swXSkgPT0gZGVncmVlXG4gICAgICAgIG5hbWUgPSBcIkEje2RlZ3JlZX1cIiBpZiBOdW1iZXIoSW50ZXJ2YWxOYW1lc1twYyAtIDFdLm1hdGNoKC9cXGQrLyk/WzBdKSA9PSBkZWdyZWVcbiAgICAgICAgbmFtZSA9IFwiZCN7ZGVncmVlfVwiIGlmIE51bWJlcihJbnRlcnZhbE5hbWVzW3BjICsgMV0ubWF0Y2goL1xcZCsvKT9bMF0pID09IGRlZ3JlZVxuICAgICAgbmFtZVxuICAgIGlmIHR5cGVvZiBAcm9vdCA9PSAnbnVtYmVyJ1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5IHRoaXMsICduYW1lJywgZ2V0OiAtPlxuICAgICAgICBcIiN7Tm90ZU5hbWVzW0Byb290XX0je0BhYmJyfVwiXG5cbiAgYXQ6IChyb290KSAtPlxuICAgIG5ldyBDaG9yZFxuICAgICAgbmFtZTogQG5hbWVcbiAgICAgIGZ1bGxfbmFtZTogQGZ1bGxfbmFtZVxuICAgICAgYWJicnM6IEBhYmJyc1xuICAgICAgcGl0Y2hfY2xhc3NlczogQHBpdGNoX2NsYXNzZXNcbiAgICAgIHJvb3Q6IHJvb3RcblxuICBkZWdyZWVfbmFtZTogKGRlZ3JlZV9pbmRleCkgLT5cbiAgICBAY29tcG9uZW50c1tkZWdyZWVfaW5kZXhdXG5cbiAgQGZyb21QaXRjaGVzOiAocGl0Y2hlcykgLT5cbiAgICByb290ID0gcGl0Y2hlc1swXVxuICAgIENob3JkLmZyb21QaXRjaENsYXNzZXMocGl0Y2ggLSByb290IGZvciBwaXRjaCBpbiBwaXRjaGVzKS5hdChyb290KVxuXG4gIEBmcm9tUGl0Y2hDbGFzc2VzOiAocGl0Y2hDbGFzc2VzKSAtPlxuICAgIHBpdGNoQ2xhc3NlcyA9ICgobiArIDEyKSAlIDEyIGZvciBuIGluIHBpdGNoQ2xhc3Nlcykuc29ydCgpXG4gICAgY2hvcmQgPSBDaG9yZHNbcGl0Y2hDbGFzc2VzXVxuICAgIHRocm93IG5ldyBFcnJvcihcIkNvdWxkbicndCBmaW5kIGNob3JkIHdpdGggcGl0Y2ggY2xhc3NlcyAje3BpdGNoQ2xhc3Nlc31cIikgdW5sZXNzIGNob3JkXG4gICAgcmV0dXJuIGNob3JkXG5cblxuQ2hvcmREZWZpbml0aW9ucyA9IFtcbiAge25hbWU6ICdNYWpvcicsIGFiYnJzOiBbJycsICdNJ10sIHBpdGNoX2NsYXNzZXM6ICcwNDcnfSxcbiAge25hbWU6ICdNaW5vcicsIGFiYnI6ICdtJywgcGl0Y2hfY2xhc3NlczogJzAzNyd9LFxuICB7bmFtZTogJ0F1Z21lbnRlZCcsIGFiYnJzOiBbJysnLCAnYXVnJ10sIHBpdGNoX2NsYXNzZXM6ICcwNDgnfSxcbiAge25hbWU6ICdEaW1pbmlzaGVkJywgYWJicnM6IFsnwrAnLCAnZGltJ10sIHBpdGNoX2NsYXNzZXM6ICcwMzYnfSxcbiAge25hbWU6ICdTdXMyJywgYWJicjogJ3N1czInLCBwaXRjaF9jbGFzc2VzOiAnMDI3J30sXG4gIHtuYW1lOiAnU3VzNCcsIGFiYnI6ICdzdXM0JywgcGl0Y2hfY2xhc3NlczogJzA1Nyd9LFxuICB7bmFtZTogJ0RvbWluYW50IDd0aCcsIGFiYnJzOiBbJzcnLCAnZG9tNyddLCBwaXRjaF9jbGFzc2VzOiAnMDQ3dCd9LFxuICB7bmFtZTogJ0F1Z21lbnRlZCA3dGgnLCBhYmJyczogWycrNycsICc3YXVnJ10sIHBpdGNoX2NsYXNzZXM6ICcwNDh0J30sXG4gIHtuYW1lOiAnRGltaW5pc2hlZCA3dGgnLCBhYmJyczogWyfCsDcnLCAnZGltNyddLCBwaXRjaF9jbGFzc2VzOiAnMDM2OSd9LFxuICB7bmFtZTogJ01ham9yIDd0aCcsIGFiYnI6ICdtYWo3JywgcGl0Y2hfY2xhc3NlczogJzA0N2UnfSxcbiAge25hbWU6ICdNaW5vciA3dGgnLCBhYmJyOiAnbWluNycsIHBpdGNoX2NsYXNzZXM6ICcwMzd0J30sXG4gIHtuYW1lOiAnRG9taW5hbnQgN2I1JywgYWJicjogJzdiNScsIHBpdGNoX2NsYXNzZXM6ICcwNDZ0J30sXG4gICMgZm9sbG93aW5nIGlzIGFsc28gaGFsZi1kaW1pbmlzaGVkIDd0aFxuICB7bmFtZTogJ01pbm9yIDd0aCBiNScsIGFiYnJzOiBbJ8O4JywgJ8OYJywgJ203YjUnXSwgcGl0Y2hfY2xhc3NlczogJzAzNnQnfSxcbiAge25hbWU6ICdEaW1pbmlzaGVkIE1haiA3dGgnLCBhYmJyOiAnwrBNYWo3JywgcGl0Y2hfY2xhc3NlczogJzAzNmUnfSxcbiAge25hbWU6ICdNaW5vci1NYWpvciA3dGgnLCBhYmJyczogWydtaW4vbWFqNycsICdtaW4obWFqNyknXSwgcGl0Y2hfY2xhc3NlczogJzAzN2UnfSxcbiAge25hbWU6ICc2dGgnLCBhYmJyczogWyc2JywgJ002JywgJ002JywgJ21hajYnXSwgcGl0Y2hfY2xhc3NlczogJzA0NzknfSxcbiAge25hbWU6ICdNaW5vciA2dGgnLCBhYmJyczogWydtNicsICdtaW42J10sIHBpdGNoX2NsYXNzZXM6ICcwMzc5J30sXG5dXG5cbiMgQ2hvcmRzIGlzIGFuIGFycmF5IG9mIGNob3JkIGNsYXNzZXNcbkNob3JkcyA9IENob3JkRGVmaW5pdGlvbnMubWFwIChzcGVjKSAtPlxuICBzcGVjLmZ1bGxfbmFtZSA9IHNwZWMubmFtZVxuICBzcGVjLm5hbWUgPSBzcGVjLm5hbWVcbiAgICAucmVwbGFjZSgvTWFqb3IoPyEkKS8sICdNYWonKVxuICAgIC5yZXBsYWNlKC9NaW5vcig/ISQpLywgJ01pbicpXG4gICAgLnJlcGxhY2UoJ0RvbWluYW50JywgJ0RvbScpXG4gICAgLnJlcGxhY2UoJ0RpbWluaXNoZWQnLCAnRGltJylcbiAgc3BlYy5hYmJycyBvcj0gW3NwZWMuYWJicl1cbiAgc3BlYy5hYmJycyA9IHNwZWMuYWJicnMuc3BsaXQoL3MvKSBpZiB0eXBlb2Ygc3BlYy5hYmJycyA9PSAnc3RyaW5nJ1xuICBzcGVjLmFiYnIgb3I9IHNwZWMuYWJicnNbMF1cbiAgc3BlYy5waXRjaF9jbGFzc2VzID0gc3BlYy5waXRjaF9jbGFzc2VzLm1hdGNoKC8uL2cpLm1hcCAoYykgLT4geyd0JzoxMCwgJ2UnOjExfVtjXSBvciBOdW1iZXIoYylcbiAgbmV3IENob3JkIHNwZWNcblxuIyBgQ2hvcmRzYCBpcyBhbHNvIGluZGV4ZWQgYnkgY2hvcmQgbmFtZXMgYW5kIGFiYnJldmlhdGlvbnMsIGFuZCBieSBwaXRjaCBjbGFzc2VzXG5kbyAtPlxuICBmb3IgY2hvcmQgaW4gQ2hvcmRzXG4gICAge25hbWUsIGZ1bGxfbmFtZSwgYWJicnN9ID0gY2hvcmRcbiAgICBDaG9yZHNba2V5XSA9IGNob3JkIGZvciBrZXkgaW4gW25hbWUsIGZ1bGxfbmFtZV0uY29uY2F0KGFiYnJzKVxuICAgIENob3Jkc1tjaG9yZC5waXRjaF9jbGFzc2VzXSA9IGNob3JkXG5cblxuI1xuIyBFeHBvcnRzXG4jXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBDaG9yZHNcbiAgSW50ZXJ2YWxOYW1lc1xuICBMb25nSW50ZXJ2YWxOYW1lc1xuICBNb2Rlc1xuICBOb3RlTmFtZXNcbiAgU2NhbGVcbiAgU2NhbGVzXG4gIGludGVydmFsX2NsYXNzX2JldHdlZW5cbn1cbiIsIkZ1bmN0aW9uOjpkZWZpbmUgfHw9IChuYW1lLCBkZXNjKSAtPlxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkgQHByb3RvdHlwZSwgbmFtZSwgZGVzY1xuXG5GdW5jdGlvbjo6Y2FjaGVkX2dldHRlciB8fD0gKG5hbWUsIGZuKSAtPlxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkgQHByb3RvdHlwZSwgbmFtZSwgZ2V0OiAtPlxuICAgIGNhY2hlID0gQF9nZXR0ZXJfY2FjaGUgfHw9IHt9XG4gICAgcmV0dXJuIGNhY2hlW25hbWVdIGlmIG5hbWUgb2YgY2FjaGVcbiAgICBjYWNoZVtuYW1lXSA9IGZuLmNhbGwodGhpcylcblxuaHN2MnJnYiA9ICh7aCwgcywgdn0pIC0+XG4gIGggLz0gMzYwXG4gIGMgPSB2ICogc1xuICB4ID0gYyAqICgxIC0gTWF0aC5hYnMoKGggKiA2KSAlIDIgLSAxKSlcbiAgY29tcG9uZW50cyA9IHN3aXRjaCBNYXRoLmZsb29yKGggKiA2KSAlIDZcbiAgICB3aGVuIDAgdGhlbiBbYywgeCwgMF1cbiAgICB3aGVuIDEgdGhlbiBbeCwgYywgMF1cbiAgICB3aGVuIDIgdGhlbiBbMCwgYywgeF1cbiAgICB3aGVuIDMgdGhlbiBbMCwgeCwgY11cbiAgICB3aGVuIDQgdGhlbiBbeCwgMCwgY11cbiAgICB3aGVuIDUgdGhlbiBbYywgMCwgeF1cbiAgW3IsIGcsIGJdID0gKGNvbXBvbmVudCArIHYgLSBjIGZvciBjb21wb25lbnQgaW4gY29tcG9uZW50cylcbiAge3IsIGcsIGJ9XG5cbnJnYjJjc3MgPSAoe3IsIGcsIGJ9KSAtPlxuICBbciwgZywgYl0gPSAoTWF0aC5mbG9vcigyNTUgKiBjKSBmb3IgYyBpbiBbciwgZywgYl0pXG4gIFwicmdiKCN7cn0sICN7Z30sICN7Yn0pXCJcblxuaHN2MmNzcyA9IChoc3YpIC0+IHJnYjJjc3MgaHN2MnJnYihoc3YpXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBoc3YyY3NzXG4gIGhzdjJyZ2JcbiAgcmdiMmNzc1xufVxuIiwidmFyIHByb2Nlc3M9cmVxdWlyZShcIl9fYnJvd3NlcmlmeV9wcm9jZXNzXCIpO2lmICghcHJvY2Vzcy5FdmVudEVtaXR0ZXIpIHByb2Nlc3MuRXZlbnRFbWl0dGVyID0gZnVuY3Rpb24gKCkge307XG5cbnZhciBFdmVudEVtaXR0ZXIgPSBleHBvcnRzLkV2ZW50RW1pdHRlciA9IHByb2Nlc3MuRXZlbnRFbWl0dGVyO1xudmFyIGlzQXJyYXkgPSB0eXBlb2YgQXJyYXkuaXNBcnJheSA9PT0gJ2Z1bmN0aW9uJ1xuICAgID8gQXJyYXkuaXNBcnJheVxuICAgIDogZnVuY3Rpb24gKHhzKSB7XG4gICAgICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoeHMpID09PSAnW29iamVjdCBBcnJheV0nXG4gICAgfVxuO1xuZnVuY3Rpb24gaW5kZXhPZiAoeHMsIHgpIHtcbiAgICBpZiAoeHMuaW5kZXhPZikgcmV0dXJuIHhzLmluZGV4T2YoeCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB4cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoeCA9PT0geHNbaV0pIHJldHVybiBpO1xuICAgIH1cbiAgICByZXR1cm4gLTE7XG59XG5cbi8vIEJ5IGRlZmF1bHQgRXZlbnRFbWl0dGVycyB3aWxsIHByaW50IGEgd2FybmluZyBpZiBtb3JlIHRoYW5cbi8vIDEwIGxpc3RlbmVycyBhcmUgYWRkZWQgdG8gaXQuIFRoaXMgaXMgYSB1c2VmdWwgZGVmYXVsdCB3aGljaFxuLy8gaGVscHMgZmluZGluZyBtZW1vcnkgbGVha3MuXG4vL1xuLy8gT2J2aW91c2x5IG5vdCBhbGwgRW1pdHRlcnMgc2hvdWxkIGJlIGxpbWl0ZWQgdG8gMTAuIFRoaXMgZnVuY3Rpb24gYWxsb3dzXG4vLyB0aGF0IHRvIGJlIGluY3JlYXNlZC4gU2V0IHRvIHplcm8gZm9yIHVubGltaXRlZC5cbnZhciBkZWZhdWx0TWF4TGlzdGVuZXJzID0gMTA7XG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnNldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uKG4pIHtcbiAgaWYgKCF0aGlzLl9ldmVudHMpIHRoaXMuX2V2ZW50cyA9IHt9O1xuICB0aGlzLl9ldmVudHMubWF4TGlzdGVuZXJzID0gbjtcbn07XG5cblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24odHlwZSkge1xuICAvLyBJZiB0aGVyZSBpcyBubyAnZXJyb3InIGV2ZW50IGxpc3RlbmVyIHRoZW4gdGhyb3cuXG4gIGlmICh0eXBlID09PSAnZXJyb3InKSB7XG4gICAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50cy5lcnJvciB8fFxuICAgICAgICAoaXNBcnJheSh0aGlzLl9ldmVudHMuZXJyb3IpICYmICF0aGlzLl9ldmVudHMuZXJyb3IubGVuZ3RoKSlcbiAgICB7XG4gICAgICBpZiAoYXJndW1lbnRzWzFdIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgdGhyb3cgYXJndW1lbnRzWzFdOyAvLyBVbmhhbmRsZWQgJ2Vycm9yJyBldmVudFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5jYXVnaHQsIHVuc3BlY2lmaWVkICdlcnJvcicgZXZlbnQuXCIpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIGlmICghdGhpcy5fZXZlbnRzKSByZXR1cm4gZmFsc2U7XG4gIHZhciBoYW5kbGVyID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuICBpZiAoIWhhbmRsZXIpIHJldHVybiBmYWxzZTtcblxuICBpZiAodHlwZW9mIGhhbmRsZXIgPT0gJ2Z1bmN0aW9uJykge1xuICAgIHN3aXRjaCAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgLy8gZmFzdCBjYXNlc1xuICAgICAgY2FzZSAxOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAyOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDM6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0sIGFyZ3VtZW50c1syXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgLy8gc2xvd2VyXG4gICAgICBkZWZhdWx0OlxuICAgICAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgICAgIGhhbmRsZXIuYXBwbHkodGhpcywgYXJncyk7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuXG4gIH0gZWxzZSBpZiAoaXNBcnJheShoYW5kbGVyKSkge1xuICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcblxuICAgIHZhciBsaXN0ZW5lcnMgPSBoYW5kbGVyLnNsaWNlKCk7XG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBsaXN0ZW5lcnMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICBsaXN0ZW5lcnNbaV0uYXBwbHkodGhpcywgYXJncyk7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59O1xuXG4vLyBFdmVudEVtaXR0ZXIgaXMgZGVmaW5lZCBpbiBzcmMvbm9kZV9ldmVudHMuY2Ncbi8vIEV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCgpIGlzIGFsc28gZGVmaW5lZCB0aGVyZS5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICBpZiAoJ2Z1bmN0aW9uJyAhPT0gdHlwZW9mIGxpc3RlbmVyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdhZGRMaXN0ZW5lciBvbmx5IHRha2VzIGluc3RhbmNlcyBvZiBGdW5jdGlvbicpO1xuICB9XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpIHRoaXMuX2V2ZW50cyA9IHt9O1xuXG4gIC8vIFRvIGF2b2lkIHJlY3Vyc2lvbiBpbiB0aGUgY2FzZSB0aGF0IHR5cGUgPT0gXCJuZXdMaXN0ZW5lcnNcIiEgQmVmb3JlXG4gIC8vIGFkZGluZyBpdCB0byB0aGUgbGlzdGVuZXJzLCBmaXJzdCBlbWl0IFwibmV3TGlzdGVuZXJzXCIuXG4gIHRoaXMuZW1pdCgnbmV3TGlzdGVuZXInLCB0eXBlLCBsaXN0ZW5lcik7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHNbdHlwZV0pIHtcbiAgICAvLyBPcHRpbWl6ZSB0aGUgY2FzZSBvZiBvbmUgbGlzdGVuZXIuIERvbid0IG5lZWQgdGhlIGV4dHJhIGFycmF5IG9iamVjdC5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBsaXN0ZW5lcjtcbiAgfSBlbHNlIGlmIChpc0FycmF5KHRoaXMuX2V2ZW50c1t0eXBlXSkpIHtcblxuICAgIC8vIENoZWNrIGZvciBsaXN0ZW5lciBsZWFrXG4gICAgaWYgKCF0aGlzLl9ldmVudHNbdHlwZV0ud2FybmVkKSB7XG4gICAgICB2YXIgbTtcbiAgICAgIGlmICh0aGlzLl9ldmVudHMubWF4TGlzdGVuZXJzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgbSA9IHRoaXMuX2V2ZW50cy5tYXhMaXN0ZW5lcnM7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBtID0gZGVmYXVsdE1heExpc3RlbmVycztcbiAgICAgIH1cblxuICAgICAgaWYgKG0gJiYgbSA+IDAgJiYgdGhpcy5fZXZlbnRzW3R5cGVdLmxlbmd0aCA+IG0pIHtcbiAgICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCA9IHRydWU7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJyhub2RlKSB3YXJuaW5nOiBwb3NzaWJsZSBFdmVudEVtaXR0ZXIgbWVtb3J5ICcgK1xuICAgICAgICAgICAgICAgICAgICAgICdsZWFrIGRldGVjdGVkLiAlZCBsaXN0ZW5lcnMgYWRkZWQuICcgK1xuICAgICAgICAgICAgICAgICAgICAgICdVc2UgZW1pdHRlci5zZXRNYXhMaXN0ZW5lcnMoKSB0byBpbmNyZWFzZSBsaW1pdC4nLFxuICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGgpO1xuICAgICAgICBjb25zb2xlLnRyYWNlKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gSWYgd2UndmUgYWxyZWFkeSBnb3QgYW4gYXJyYXksIGp1c3QgYXBwZW5kLlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5wdXNoKGxpc3RlbmVyKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBBZGRpbmcgdGhlIHNlY29uZCBlbGVtZW50LCBuZWVkIHRvIGNoYW5nZSB0byBhcnJheS5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBbdGhpcy5fZXZlbnRzW3R5cGVdLCBsaXN0ZW5lcl07XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub24gPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHNlbGYub24odHlwZSwgZnVuY3Rpb24gZygpIHtcbiAgICBzZWxmLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGcpO1xuICAgIGxpc3RlbmVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH0pO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIGlmICgnZnVuY3Rpb24nICE9PSB0eXBlb2YgbGlzdGVuZXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3JlbW92ZUxpc3RlbmVyIG9ubHkgdGFrZXMgaW5zdGFuY2VzIG9mIEZ1bmN0aW9uJyk7XG4gIH1cblxuICAvLyBkb2VzIG5vdCB1c2UgbGlzdGVuZXJzKCksIHNvIG5vIHNpZGUgZWZmZWN0IG9mIGNyZWF0aW5nIF9ldmVudHNbdHlwZV1cbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1t0eXBlXSkgcmV0dXJuIHRoaXM7XG5cbiAgdmFyIGxpc3QgPSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgaWYgKGlzQXJyYXkobGlzdCkpIHtcbiAgICB2YXIgaSA9IGluZGV4T2YobGlzdCwgbGlzdGVuZXIpO1xuICAgIGlmIChpIDwgMCkgcmV0dXJuIHRoaXM7XG4gICAgbGlzdC5zcGxpY2UoaSwgMSk7XG4gICAgaWYgKGxpc3QubGVuZ3RoID09IDApXG4gICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICB9IGVsc2UgaWYgKHRoaXMuX2V2ZW50c1t0eXBlXSA9PT0gbGlzdGVuZXIpIHtcbiAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUFsbExpc3RlbmVycyA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIGRvZXMgbm90IHVzZSBsaXN0ZW5lcnMoKSwgc28gbm8gc2lkZSBlZmZlY3Qgb2YgY3JlYXRpbmcgX2V2ZW50c1t0eXBlXVxuICBpZiAodHlwZSAmJiB0aGlzLl9ldmVudHMgJiYgdGhpcy5fZXZlbnRzW3R5cGVdKSB0aGlzLl9ldmVudHNbdHlwZV0gPSBudWxsO1xuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICBpZiAoIXRoaXMuX2V2ZW50cykgdGhpcy5fZXZlbnRzID0ge307XG4gIGlmICghdGhpcy5fZXZlbnRzW3R5cGVdKSB0aGlzLl9ldmVudHNbdHlwZV0gPSBbXTtcbiAgaWYgKCFpc0FycmF5KHRoaXMuX2V2ZW50c1t0eXBlXSkpIHtcbiAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBbdGhpcy5fZXZlbnRzW3R5cGVdXTtcbiAgfVxuICByZXR1cm4gdGhpcy5fZXZlbnRzW3R5cGVdO1xufTtcblxuRXZlbnRFbWl0dGVyLmxpc3RlbmVyQ291bnQgPSBmdW5jdGlvbihlbWl0dGVyLCB0eXBlKSB7XG4gIHZhciByZXQ7XG4gIGlmICghZW1pdHRlci5fZXZlbnRzIHx8ICFlbWl0dGVyLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0ID0gMDtcbiAgZWxzZSBpZiAodHlwZW9mIGVtaXR0ZXIuX2V2ZW50c1t0eXBlXSA9PT0gJ2Z1bmN0aW9uJylcbiAgICByZXQgPSAxO1xuICBlbHNlXG4gICAgcmV0ID0gZW1pdHRlci5fZXZlbnRzW3R5cGVdLmxlbmd0aDtcbiAgcmV0dXJuIHJldDtcbn07XG4iLCIvLyBub3RoaW5nIHRvIHNlZSBoZXJlLi4uIG5vIGZpbGUgbWV0aG9kcyBmb3IgdGhlIGJyb3dzZXJcbiIsInZhciBwcm9jZXNzPXJlcXVpcmUoXCJfX2Jyb3dzZXJpZnlfcHJvY2Vzc1wiKTtmdW5jdGlvbiBmaWx0ZXIgKHhzLCBmbikge1xuICAgIHZhciByZXMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHhzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChmbih4c1tpXSwgaSwgeHMpKSByZXMucHVzaCh4c1tpXSk7XG4gICAgfVxuICAgIHJldHVybiByZXM7XG59XG5cbi8vIHJlc29sdmVzIC4gYW5kIC4uIGVsZW1lbnRzIGluIGEgcGF0aCBhcnJheSB3aXRoIGRpcmVjdG9yeSBuYW1lcyB0aGVyZVxuLy8gbXVzdCBiZSBubyBzbGFzaGVzLCBlbXB0eSBlbGVtZW50cywgb3IgZGV2aWNlIG5hbWVzIChjOlxcKSBpbiB0aGUgYXJyYXlcbi8vIChzbyBhbHNvIG5vIGxlYWRpbmcgYW5kIHRyYWlsaW5nIHNsYXNoZXMgLSBpdCBkb2VzIG5vdCBkaXN0aW5ndWlzaFxuLy8gcmVsYXRpdmUgYW5kIGFic29sdXRlIHBhdGhzKVxuZnVuY3Rpb24gbm9ybWFsaXplQXJyYXkocGFydHMsIGFsbG93QWJvdmVSb290KSB7XG4gIC8vIGlmIHRoZSBwYXRoIHRyaWVzIHRvIGdvIGFib3ZlIHRoZSByb290LCBgdXBgIGVuZHMgdXAgPiAwXG4gIHZhciB1cCA9IDA7XG4gIGZvciAodmFyIGkgPSBwYXJ0cy5sZW5ndGg7IGkgPj0gMDsgaS0tKSB7XG4gICAgdmFyIGxhc3QgPSBwYXJ0c1tpXTtcbiAgICBpZiAobGFzdCA9PSAnLicpIHtcbiAgICAgIHBhcnRzLnNwbGljZShpLCAxKTtcbiAgICB9IGVsc2UgaWYgKGxhc3QgPT09ICcuLicpIHtcbiAgICAgIHBhcnRzLnNwbGljZShpLCAxKTtcbiAgICAgIHVwKys7XG4gICAgfSBlbHNlIGlmICh1cCkge1xuICAgICAgcGFydHMuc3BsaWNlKGksIDEpO1xuICAgICAgdXAtLTtcbiAgICB9XG4gIH1cblxuICAvLyBpZiB0aGUgcGF0aCBpcyBhbGxvd2VkIHRvIGdvIGFib3ZlIHRoZSByb290LCByZXN0b3JlIGxlYWRpbmcgLi5zXG4gIGlmIChhbGxvd0Fib3ZlUm9vdCkge1xuICAgIGZvciAoOyB1cC0tOyB1cCkge1xuICAgICAgcGFydHMudW5zaGlmdCgnLi4nKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcGFydHM7XG59XG5cbi8vIFJlZ2V4IHRvIHNwbGl0IGEgZmlsZW5hbWUgaW50byBbKiwgZGlyLCBiYXNlbmFtZSwgZXh0XVxuLy8gcG9zaXggdmVyc2lvblxudmFyIHNwbGl0UGF0aFJlID0gL14oLitcXC8oPyEkKXxcXC8pPygoPzouKz8pPyhcXC5bXi5dKik/KSQvO1xuXG4vLyBwYXRoLnJlc29sdmUoW2Zyb20gLi4uXSwgdG8pXG4vLyBwb3NpeCB2ZXJzaW9uXG5leHBvcnRzLnJlc29sdmUgPSBmdW5jdGlvbigpIHtcbnZhciByZXNvbHZlZFBhdGggPSAnJyxcbiAgICByZXNvbHZlZEFic29sdXRlID0gZmFsc2U7XG5cbmZvciAodmFyIGkgPSBhcmd1bWVudHMubGVuZ3RoOyBpID49IC0xICYmICFyZXNvbHZlZEFic29sdXRlOyBpLS0pIHtcbiAgdmFyIHBhdGggPSAoaSA+PSAwKVxuICAgICAgPyBhcmd1bWVudHNbaV1cbiAgICAgIDogcHJvY2Vzcy5jd2QoKTtcblxuICAvLyBTa2lwIGVtcHR5IGFuZCBpbnZhbGlkIGVudHJpZXNcbiAgaWYgKHR5cGVvZiBwYXRoICE9PSAnc3RyaW5nJyB8fCAhcGF0aCkge1xuICAgIGNvbnRpbnVlO1xuICB9XG5cbiAgcmVzb2x2ZWRQYXRoID0gcGF0aCArICcvJyArIHJlc29sdmVkUGF0aDtcbiAgcmVzb2x2ZWRBYnNvbHV0ZSA9IHBhdGguY2hhckF0KDApID09PSAnLyc7XG59XG5cbi8vIEF0IHRoaXMgcG9pbnQgdGhlIHBhdGggc2hvdWxkIGJlIHJlc29sdmVkIHRvIGEgZnVsbCBhYnNvbHV0ZSBwYXRoLCBidXRcbi8vIGhhbmRsZSByZWxhdGl2ZSBwYXRocyB0byBiZSBzYWZlIChtaWdodCBoYXBwZW4gd2hlbiBwcm9jZXNzLmN3ZCgpIGZhaWxzKVxuXG4vLyBOb3JtYWxpemUgdGhlIHBhdGhcbnJlc29sdmVkUGF0aCA9IG5vcm1hbGl6ZUFycmF5KGZpbHRlcihyZXNvbHZlZFBhdGguc3BsaXQoJy8nKSwgZnVuY3Rpb24ocCkge1xuICAgIHJldHVybiAhIXA7XG4gIH0pLCAhcmVzb2x2ZWRBYnNvbHV0ZSkuam9pbignLycpO1xuXG4gIHJldHVybiAoKHJlc29sdmVkQWJzb2x1dGUgPyAnLycgOiAnJykgKyByZXNvbHZlZFBhdGgpIHx8ICcuJztcbn07XG5cbi8vIHBhdGgubm9ybWFsaXplKHBhdGgpXG4vLyBwb3NpeCB2ZXJzaW9uXG5leHBvcnRzLm5vcm1hbGl6ZSA9IGZ1bmN0aW9uKHBhdGgpIHtcbnZhciBpc0Fic29sdXRlID0gcGF0aC5jaGFyQXQoMCkgPT09ICcvJyxcbiAgICB0cmFpbGluZ1NsYXNoID0gcGF0aC5zbGljZSgtMSkgPT09ICcvJztcblxuLy8gTm9ybWFsaXplIHRoZSBwYXRoXG5wYXRoID0gbm9ybWFsaXplQXJyYXkoZmlsdGVyKHBhdGguc3BsaXQoJy8nKSwgZnVuY3Rpb24ocCkge1xuICAgIHJldHVybiAhIXA7XG4gIH0pLCAhaXNBYnNvbHV0ZSkuam9pbignLycpO1xuXG4gIGlmICghcGF0aCAmJiAhaXNBYnNvbHV0ZSkge1xuICAgIHBhdGggPSAnLic7XG4gIH1cbiAgaWYgKHBhdGggJiYgdHJhaWxpbmdTbGFzaCkge1xuICAgIHBhdGggKz0gJy8nO1xuICB9XG4gIFxuICByZXR1cm4gKGlzQWJzb2x1dGUgPyAnLycgOiAnJykgKyBwYXRoO1xufTtcblxuXG4vLyBwb3NpeCB2ZXJzaW9uXG5leHBvcnRzLmpvaW4gPSBmdW5jdGlvbigpIHtcbiAgdmFyIHBhdGhzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKTtcbiAgcmV0dXJuIGV4cG9ydHMubm9ybWFsaXplKGZpbHRlcihwYXRocywgZnVuY3Rpb24ocCwgaW5kZXgpIHtcbiAgICByZXR1cm4gcCAmJiB0eXBlb2YgcCA9PT0gJ3N0cmluZyc7XG4gIH0pLmpvaW4oJy8nKSk7XG59O1xuXG5cbmV4cG9ydHMuZGlybmFtZSA9IGZ1bmN0aW9uKHBhdGgpIHtcbiAgdmFyIGRpciA9IHNwbGl0UGF0aFJlLmV4ZWMocGF0aClbMV0gfHwgJyc7XG4gIHZhciBpc1dpbmRvd3MgPSBmYWxzZTtcbiAgaWYgKCFkaXIpIHtcbiAgICAvLyBObyBkaXJuYW1lXG4gICAgcmV0dXJuICcuJztcbiAgfSBlbHNlIGlmIChkaXIubGVuZ3RoID09PSAxIHx8XG4gICAgICAoaXNXaW5kb3dzICYmIGRpci5sZW5ndGggPD0gMyAmJiBkaXIuY2hhckF0KDEpID09PSAnOicpKSB7XG4gICAgLy8gSXQgaXMganVzdCBhIHNsYXNoIG9yIGEgZHJpdmUgbGV0dGVyIHdpdGggYSBzbGFzaFxuICAgIHJldHVybiBkaXI7XG4gIH0gZWxzZSB7XG4gICAgLy8gSXQgaXMgYSBmdWxsIGRpcm5hbWUsIHN0cmlwIHRyYWlsaW5nIHNsYXNoXG4gICAgcmV0dXJuIGRpci5zdWJzdHJpbmcoMCwgZGlyLmxlbmd0aCAtIDEpO1xuICB9XG59O1xuXG5cbmV4cG9ydHMuYmFzZW5hbWUgPSBmdW5jdGlvbihwYXRoLCBleHQpIHtcbiAgdmFyIGYgPSBzcGxpdFBhdGhSZS5leGVjKHBhdGgpWzJdIHx8ICcnO1xuICAvLyBUT0RPOiBtYWtlIHRoaXMgY29tcGFyaXNvbiBjYXNlLWluc2Vuc2l0aXZlIG9uIHdpbmRvd3M/XG4gIGlmIChleHQgJiYgZi5zdWJzdHIoLTEgKiBleHQubGVuZ3RoKSA9PT0gZXh0KSB7XG4gICAgZiA9IGYuc3Vic3RyKDAsIGYubGVuZ3RoIC0gZXh0Lmxlbmd0aCk7XG4gIH1cbiAgcmV0dXJuIGY7XG59O1xuXG5cbmV4cG9ydHMuZXh0bmFtZSA9IGZ1bmN0aW9uKHBhdGgpIHtcbiAgcmV0dXJuIHNwbGl0UGF0aFJlLmV4ZWMocGF0aClbM10gfHwgJyc7XG59O1xuXG5leHBvcnRzLnJlbGF0aXZlID0gZnVuY3Rpb24oZnJvbSwgdG8pIHtcbiAgZnJvbSA9IGV4cG9ydHMucmVzb2x2ZShmcm9tKS5zdWJzdHIoMSk7XG4gIHRvID0gZXhwb3J0cy5yZXNvbHZlKHRvKS5zdWJzdHIoMSk7XG5cbiAgZnVuY3Rpb24gdHJpbShhcnIpIHtcbiAgICB2YXIgc3RhcnQgPSAwO1xuICAgIGZvciAoOyBzdGFydCA8IGFyci5sZW5ndGg7IHN0YXJ0KyspIHtcbiAgICAgIGlmIChhcnJbc3RhcnRdICE9PSAnJykgYnJlYWs7XG4gICAgfVxuXG4gICAgdmFyIGVuZCA9IGFyci5sZW5ndGggLSAxO1xuICAgIGZvciAoOyBlbmQgPj0gMDsgZW5kLS0pIHtcbiAgICAgIGlmIChhcnJbZW5kXSAhPT0gJycpIGJyZWFrO1xuICAgIH1cblxuICAgIGlmIChzdGFydCA+IGVuZCkgcmV0dXJuIFtdO1xuICAgIHJldHVybiBhcnIuc2xpY2Uoc3RhcnQsIGVuZCAtIHN0YXJ0ICsgMSk7XG4gIH1cblxuICB2YXIgZnJvbVBhcnRzID0gdHJpbShmcm9tLnNwbGl0KCcvJykpO1xuICB2YXIgdG9QYXJ0cyA9IHRyaW0odG8uc3BsaXQoJy8nKSk7XG5cbiAgdmFyIGxlbmd0aCA9IE1hdGgubWluKGZyb21QYXJ0cy5sZW5ndGgsIHRvUGFydHMubGVuZ3RoKTtcbiAgdmFyIHNhbWVQYXJ0c0xlbmd0aCA9IGxlbmd0aDtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIGlmIChmcm9tUGFydHNbaV0gIT09IHRvUGFydHNbaV0pIHtcbiAgICAgIHNhbWVQYXJ0c0xlbmd0aCA9IGk7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICB2YXIgb3V0cHV0UGFydHMgPSBbXTtcbiAgZm9yICh2YXIgaSA9IHNhbWVQYXJ0c0xlbmd0aDsgaSA8IGZyb21QYXJ0cy5sZW5ndGg7IGkrKykge1xuICAgIG91dHB1dFBhcnRzLnB1c2goJy4uJyk7XG4gIH1cblxuICBvdXRwdXRQYXJ0cyA9IG91dHB1dFBhcnRzLmNvbmNhdCh0b1BhcnRzLnNsaWNlKHNhbWVQYXJ0c0xlbmd0aCkpO1xuXG4gIHJldHVybiBvdXRwdXRQYXJ0cy5qb2luKCcvJyk7XG59O1xuXG5leHBvcnRzLnNlcCA9ICcvJztcbiIsInZhciBldmVudHMgPSByZXF1aXJlKCdldmVudHMnKTtcblxuZXhwb3J0cy5pc0FycmF5ID0gaXNBcnJheTtcbmV4cG9ydHMuaXNEYXRlID0gZnVuY3Rpb24ob2JqKXtyZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikgPT09ICdbb2JqZWN0IERhdGVdJ307XG5leHBvcnRzLmlzUmVnRXhwID0gZnVuY3Rpb24ob2JqKXtyZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikgPT09ICdbb2JqZWN0IFJlZ0V4cF0nfTtcblxuXG5leHBvcnRzLnByaW50ID0gZnVuY3Rpb24gKCkge307XG5leHBvcnRzLnB1dHMgPSBmdW5jdGlvbiAoKSB7fTtcbmV4cG9ydHMuZGVidWcgPSBmdW5jdGlvbigpIHt9O1xuXG5leHBvcnRzLmluc3BlY3QgPSBmdW5jdGlvbihvYmosIHNob3dIaWRkZW4sIGRlcHRoLCBjb2xvcnMpIHtcbiAgdmFyIHNlZW4gPSBbXTtcblxuICB2YXIgc3R5bGl6ZSA9IGZ1bmN0aW9uKHN0ciwgc3R5bGVUeXBlKSB7XG4gICAgLy8gaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9BTlNJX2VzY2FwZV9jb2RlI2dyYXBoaWNzXG4gICAgdmFyIHN0eWxlcyA9XG4gICAgICAgIHsgJ2JvbGQnIDogWzEsIDIyXSxcbiAgICAgICAgICAnaXRhbGljJyA6IFszLCAyM10sXG4gICAgICAgICAgJ3VuZGVybGluZScgOiBbNCwgMjRdLFxuICAgICAgICAgICdpbnZlcnNlJyA6IFs3LCAyN10sXG4gICAgICAgICAgJ3doaXRlJyA6IFszNywgMzldLFxuICAgICAgICAgICdncmV5JyA6IFs5MCwgMzldLFxuICAgICAgICAgICdibGFjaycgOiBbMzAsIDM5XSxcbiAgICAgICAgICAnYmx1ZScgOiBbMzQsIDM5XSxcbiAgICAgICAgICAnY3lhbicgOiBbMzYsIDM5XSxcbiAgICAgICAgICAnZ3JlZW4nIDogWzMyLCAzOV0sXG4gICAgICAgICAgJ21hZ2VudGEnIDogWzM1LCAzOV0sXG4gICAgICAgICAgJ3JlZCcgOiBbMzEsIDM5XSxcbiAgICAgICAgICAneWVsbG93JyA6IFszMywgMzldIH07XG5cbiAgICB2YXIgc3R5bGUgPVxuICAgICAgICB7ICdzcGVjaWFsJzogJ2N5YW4nLFxuICAgICAgICAgICdudW1iZXInOiAnYmx1ZScsXG4gICAgICAgICAgJ2Jvb2xlYW4nOiAneWVsbG93JyxcbiAgICAgICAgICAndW5kZWZpbmVkJzogJ2dyZXknLFxuICAgICAgICAgICdudWxsJzogJ2JvbGQnLFxuICAgICAgICAgICdzdHJpbmcnOiAnZ3JlZW4nLFxuICAgICAgICAgICdkYXRlJzogJ21hZ2VudGEnLFxuICAgICAgICAgIC8vIFwibmFtZVwiOiBpbnRlbnRpb25hbGx5IG5vdCBzdHlsaW5nXG4gICAgICAgICAgJ3JlZ2V4cCc6ICdyZWQnIH1bc3R5bGVUeXBlXTtcblxuICAgIGlmIChzdHlsZSkge1xuICAgICAgcmV0dXJuICdcXHUwMDFiWycgKyBzdHlsZXNbc3R5bGVdWzBdICsgJ20nICsgc3RyICtcbiAgICAgICAgICAgICAnXFx1MDAxYlsnICsgc3R5bGVzW3N0eWxlXVsxXSArICdtJztcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHN0cjtcbiAgICB9XG4gIH07XG4gIGlmICghIGNvbG9ycykge1xuICAgIHN0eWxpemUgPSBmdW5jdGlvbihzdHIsIHN0eWxlVHlwZSkgeyByZXR1cm4gc3RyOyB9O1xuICB9XG5cbiAgZnVuY3Rpb24gZm9ybWF0KHZhbHVlLCByZWN1cnNlVGltZXMpIHtcbiAgICAvLyBQcm92aWRlIGEgaG9vayBmb3IgdXNlci1zcGVjaWZpZWQgaW5zcGVjdCBmdW5jdGlvbnMuXG4gICAgLy8gQ2hlY2sgdGhhdCB2YWx1ZSBpcyBhbiBvYmplY3Qgd2l0aCBhbiBpbnNwZWN0IGZ1bmN0aW9uIG9uIGl0XG4gICAgaWYgKHZhbHVlICYmIHR5cGVvZiB2YWx1ZS5pbnNwZWN0ID09PSAnZnVuY3Rpb24nICYmXG4gICAgICAgIC8vIEZpbHRlciBvdXQgdGhlIHV0aWwgbW9kdWxlLCBpdCdzIGluc3BlY3QgZnVuY3Rpb24gaXMgc3BlY2lhbFxuICAgICAgICB2YWx1ZSAhPT0gZXhwb3J0cyAmJlxuICAgICAgICAvLyBBbHNvIGZpbHRlciBvdXQgYW55IHByb3RvdHlwZSBvYmplY3RzIHVzaW5nIHRoZSBjaXJjdWxhciBjaGVjay5cbiAgICAgICAgISh2YWx1ZS5jb25zdHJ1Y3RvciAmJiB2YWx1ZS5jb25zdHJ1Y3Rvci5wcm90b3R5cGUgPT09IHZhbHVlKSkge1xuICAgICAgcmV0dXJuIHZhbHVlLmluc3BlY3QocmVjdXJzZVRpbWVzKTtcbiAgICB9XG5cbiAgICAvLyBQcmltaXRpdmUgdHlwZXMgY2Fubm90IGhhdmUgcHJvcGVydGllc1xuICAgIHN3aXRjaCAodHlwZW9mIHZhbHVlKSB7XG4gICAgICBjYXNlICd1bmRlZmluZWQnOlxuICAgICAgICByZXR1cm4gc3R5bGl6ZSgndW5kZWZpbmVkJywgJ3VuZGVmaW5lZCcpO1xuXG4gICAgICBjYXNlICdzdHJpbmcnOlxuICAgICAgICB2YXIgc2ltcGxlID0gJ1xcJycgKyBKU09OLnN0cmluZ2lmeSh2YWx1ZSkucmVwbGFjZSgvXlwifFwiJC9nLCAnJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvJy9nLCBcIlxcXFwnXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcXFxcIi9nLCAnXCInKSArICdcXCcnO1xuICAgICAgICByZXR1cm4gc3R5bGl6ZShzaW1wbGUsICdzdHJpbmcnKTtcblxuICAgICAgY2FzZSAnbnVtYmVyJzpcbiAgICAgICAgcmV0dXJuIHN0eWxpemUoJycgKyB2YWx1ZSwgJ251bWJlcicpO1xuXG4gICAgICBjYXNlICdib29sZWFuJzpcbiAgICAgICAgcmV0dXJuIHN0eWxpemUoJycgKyB2YWx1ZSwgJ2Jvb2xlYW4nKTtcbiAgICB9XG4gICAgLy8gRm9yIHNvbWUgcmVhc29uIHR5cGVvZiBudWxsIGlzIFwib2JqZWN0XCIsIHNvIHNwZWNpYWwgY2FzZSBoZXJlLlxuICAgIGlmICh2YWx1ZSA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHN0eWxpemUoJ251bGwnLCAnbnVsbCcpO1xuICAgIH1cblxuICAgIC8vIExvb2sgdXAgdGhlIGtleXMgb2YgdGhlIG9iamVjdC5cbiAgICB2YXIgdmlzaWJsZV9rZXlzID0gT2JqZWN0X2tleXModmFsdWUpO1xuICAgIHZhciBrZXlzID0gc2hvd0hpZGRlbiA/IE9iamVjdF9nZXRPd25Qcm9wZXJ0eU5hbWVzKHZhbHVlKSA6IHZpc2libGVfa2V5cztcblxuICAgIC8vIEZ1bmN0aW9ucyB3aXRob3V0IHByb3BlcnRpZXMgY2FuIGJlIHNob3J0Y3V0dGVkLlxuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicgJiYga2V5cy5sZW5ndGggPT09IDApIHtcbiAgICAgIGlmIChpc1JlZ0V4cCh2YWx1ZSkpIHtcbiAgICAgICAgcmV0dXJuIHN0eWxpemUoJycgKyB2YWx1ZSwgJ3JlZ2V4cCcpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIG5hbWUgPSB2YWx1ZS5uYW1lID8gJzogJyArIHZhbHVlLm5hbWUgOiAnJztcbiAgICAgICAgcmV0dXJuIHN0eWxpemUoJ1tGdW5jdGlvbicgKyBuYW1lICsgJ10nLCAnc3BlY2lhbCcpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIERhdGVzIHdpdGhvdXQgcHJvcGVydGllcyBjYW4gYmUgc2hvcnRjdXR0ZWRcbiAgICBpZiAoaXNEYXRlKHZhbHVlKSAmJiBrZXlzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIHN0eWxpemUodmFsdWUudG9VVENTdHJpbmcoKSwgJ2RhdGUnKTtcbiAgICB9XG5cbiAgICB2YXIgYmFzZSwgdHlwZSwgYnJhY2VzO1xuICAgIC8vIERldGVybWluZSB0aGUgb2JqZWN0IHR5cGVcbiAgICBpZiAoaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgIHR5cGUgPSAnQXJyYXknO1xuICAgICAgYnJhY2VzID0gWydbJywgJ10nXTtcbiAgICB9IGVsc2Uge1xuICAgICAgdHlwZSA9ICdPYmplY3QnO1xuICAgICAgYnJhY2VzID0gWyd7JywgJ30nXTtcbiAgICB9XG5cbiAgICAvLyBNYWtlIGZ1bmN0aW9ucyBzYXkgdGhhdCB0aGV5IGFyZSBmdW5jdGlvbnNcbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB2YXIgbiA9IHZhbHVlLm5hbWUgPyAnOiAnICsgdmFsdWUubmFtZSA6ICcnO1xuICAgICAgYmFzZSA9IChpc1JlZ0V4cCh2YWx1ZSkpID8gJyAnICsgdmFsdWUgOiAnIFtGdW5jdGlvbicgKyBuICsgJ10nO1xuICAgIH0gZWxzZSB7XG4gICAgICBiYXNlID0gJyc7XG4gICAgfVxuXG4gICAgLy8gTWFrZSBkYXRlcyB3aXRoIHByb3BlcnRpZXMgZmlyc3Qgc2F5IHRoZSBkYXRlXG4gICAgaWYgKGlzRGF0ZSh2YWx1ZSkpIHtcbiAgICAgIGJhc2UgPSAnICcgKyB2YWx1ZS50b1VUQ1N0cmluZygpO1xuICAgIH1cblxuICAgIGlmIChrZXlzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIGJyYWNlc1swXSArIGJhc2UgKyBicmFjZXNbMV07XG4gICAgfVxuXG4gICAgaWYgKHJlY3Vyc2VUaW1lcyA8IDApIHtcbiAgICAgIGlmIChpc1JlZ0V4cCh2YWx1ZSkpIHtcbiAgICAgICAgcmV0dXJuIHN0eWxpemUoJycgKyB2YWx1ZSwgJ3JlZ2V4cCcpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHN0eWxpemUoJ1tPYmplY3RdJywgJ3NwZWNpYWwnKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBzZWVuLnB1c2godmFsdWUpO1xuXG4gICAgdmFyIG91dHB1dCA9IGtleXMubWFwKGZ1bmN0aW9uKGtleSkge1xuICAgICAgdmFyIG5hbWUsIHN0cjtcbiAgICAgIGlmICh2YWx1ZS5fX2xvb2t1cEdldHRlcl9fKSB7XG4gICAgICAgIGlmICh2YWx1ZS5fX2xvb2t1cEdldHRlcl9fKGtleSkpIHtcbiAgICAgICAgICBpZiAodmFsdWUuX19sb29rdXBTZXR0ZXJfXyhrZXkpKSB7XG4gICAgICAgICAgICBzdHIgPSBzdHlsaXplKCdbR2V0dGVyL1NldHRlcl0nLCAnc3BlY2lhbCcpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdHIgPSBzdHlsaXplKCdbR2V0dGVyXScsICdzcGVjaWFsJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmICh2YWx1ZS5fX2xvb2t1cFNldHRlcl9fKGtleSkpIHtcbiAgICAgICAgICAgIHN0ciA9IHN0eWxpemUoJ1tTZXR0ZXJdJywgJ3NwZWNpYWwnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICh2aXNpYmxlX2tleXMuaW5kZXhPZihrZXkpIDwgMCkge1xuICAgICAgICBuYW1lID0gJ1snICsga2V5ICsgJ10nO1xuICAgICAgfVxuICAgICAgaWYgKCFzdHIpIHtcbiAgICAgICAgaWYgKHNlZW4uaW5kZXhPZih2YWx1ZVtrZXldKSA8IDApIHtcbiAgICAgICAgICBpZiAocmVjdXJzZVRpbWVzID09PSBudWxsKSB7XG4gICAgICAgICAgICBzdHIgPSBmb3JtYXQodmFsdWVba2V5XSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN0ciA9IGZvcm1hdCh2YWx1ZVtrZXldLCByZWN1cnNlVGltZXMgLSAxKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHN0ci5pbmRleE9mKCdcXG4nKSA+IC0xKSB7XG4gICAgICAgICAgICBpZiAoaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgc3RyID0gc3RyLnNwbGl0KCdcXG4nKS5tYXAoZnVuY3Rpb24obGluZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAnICAnICsgbGluZTtcbiAgICAgICAgICAgICAgfSkuam9pbignXFxuJykuc3Vic3RyKDIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgc3RyID0gJ1xcbicgKyBzdHIuc3BsaXQoJ1xcbicpLm1hcChmdW5jdGlvbihsaW5lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICcgICAnICsgbGluZTtcbiAgICAgICAgICAgICAgfSkuam9pbignXFxuJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN0ciA9IHN0eWxpemUoJ1tDaXJjdWxhcl0nLCAnc3BlY2lhbCcpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIG5hbWUgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIGlmICh0eXBlID09PSAnQXJyYXknICYmIGtleS5tYXRjaCgvXlxcZCskLykpIHtcbiAgICAgICAgICByZXR1cm4gc3RyO1xuICAgICAgICB9XG4gICAgICAgIG5hbWUgPSBKU09OLnN0cmluZ2lmeSgnJyArIGtleSk7XG4gICAgICAgIGlmIChuYW1lLm1hdGNoKC9eXCIoW2EtekEtWl9dW2EtekEtWl8wLTldKilcIiQvKSkge1xuICAgICAgICAgIG5hbWUgPSBuYW1lLnN1YnN0cigxLCBuYW1lLmxlbmd0aCAtIDIpO1xuICAgICAgICAgIG5hbWUgPSBzdHlsaXplKG5hbWUsICduYW1lJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbmFtZSA9IG5hbWUucmVwbGFjZSgvJy9nLCBcIlxcXFwnXCIpXG4gICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxcXFwiL2csICdcIicpXG4gICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvKF5cInxcIiQpL2csIFwiJ1wiKTtcbiAgICAgICAgICBuYW1lID0gc3R5bGl6ZShuYW1lLCAnc3RyaW5nJyk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG5hbWUgKyAnOiAnICsgc3RyO1xuICAgIH0pO1xuXG4gICAgc2Vlbi5wb3AoKTtcblxuICAgIHZhciBudW1MaW5lc0VzdCA9IDA7XG4gICAgdmFyIGxlbmd0aCA9IG91dHB1dC5yZWR1Y2UoZnVuY3Rpb24ocHJldiwgY3VyKSB7XG4gICAgICBudW1MaW5lc0VzdCsrO1xuICAgICAgaWYgKGN1ci5pbmRleE9mKCdcXG4nKSA+PSAwKSBudW1MaW5lc0VzdCsrO1xuICAgICAgcmV0dXJuIHByZXYgKyBjdXIubGVuZ3RoICsgMTtcbiAgICB9LCAwKTtcblxuICAgIGlmIChsZW5ndGggPiA1MCkge1xuICAgICAgb3V0cHV0ID0gYnJhY2VzWzBdICtcbiAgICAgICAgICAgICAgIChiYXNlID09PSAnJyA/ICcnIDogYmFzZSArICdcXG4gJykgK1xuICAgICAgICAgICAgICAgJyAnICtcbiAgICAgICAgICAgICAgIG91dHB1dC5qb2luKCcsXFxuICAnKSArXG4gICAgICAgICAgICAgICAnICcgK1xuICAgICAgICAgICAgICAgYnJhY2VzWzFdO1xuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dHB1dCA9IGJyYWNlc1swXSArIGJhc2UgKyAnICcgKyBvdXRwdXQuam9pbignLCAnKSArICcgJyArIGJyYWNlc1sxXTtcbiAgICB9XG5cbiAgICByZXR1cm4gb3V0cHV0O1xuICB9XG4gIHJldHVybiBmb3JtYXQob2JqLCAodHlwZW9mIGRlcHRoID09PSAndW5kZWZpbmVkJyA/IDIgOiBkZXB0aCkpO1xufTtcblxuXG5mdW5jdGlvbiBpc0FycmF5KGFyKSB7XG4gIHJldHVybiBBcnJheS5pc0FycmF5KGFyKSB8fFxuICAgICAgICAgKHR5cGVvZiBhciA9PT0gJ29iamVjdCcgJiYgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGFyKSA9PT0gJ1tvYmplY3QgQXJyYXldJyk7XG59XG5cblxuZnVuY3Rpb24gaXNSZWdFeHAocmUpIHtcbiAgdHlwZW9mIHJlID09PSAnb2JqZWN0JyAmJiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwocmUpID09PSAnW29iamVjdCBSZWdFeHBdJztcbn1cblxuXG5mdW5jdGlvbiBpc0RhdGUoZCkge1xuICByZXR1cm4gdHlwZW9mIGQgPT09ICdvYmplY3QnICYmIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChkKSA9PT0gJ1tvYmplY3QgRGF0ZV0nO1xufVxuXG5mdW5jdGlvbiBwYWQobikge1xuICByZXR1cm4gbiA8IDEwID8gJzAnICsgbi50b1N0cmluZygxMCkgOiBuLnRvU3RyaW5nKDEwKTtcbn1cblxudmFyIG1vbnRocyA9IFsnSmFuJywgJ0ZlYicsICdNYXInLCAnQXByJywgJ01heScsICdKdW4nLCAnSnVsJywgJ0F1ZycsICdTZXAnLFxuICAgICAgICAgICAgICAnT2N0JywgJ05vdicsICdEZWMnXTtcblxuLy8gMjYgRmViIDE2OjE5OjM0XG5mdW5jdGlvbiB0aW1lc3RhbXAoKSB7XG4gIHZhciBkID0gbmV3IERhdGUoKTtcbiAgdmFyIHRpbWUgPSBbcGFkKGQuZ2V0SG91cnMoKSksXG4gICAgICAgICAgICAgIHBhZChkLmdldE1pbnV0ZXMoKSksXG4gICAgICAgICAgICAgIHBhZChkLmdldFNlY29uZHMoKSldLmpvaW4oJzonKTtcbiAgcmV0dXJuIFtkLmdldERhdGUoKSwgbW9udGhzW2QuZ2V0TW9udGgoKV0sIHRpbWVdLmpvaW4oJyAnKTtcbn1cblxuZXhwb3J0cy5sb2cgPSBmdW5jdGlvbiAobXNnKSB7fTtcblxuZXhwb3J0cy5wdW1wID0gbnVsbDtcblxudmFyIE9iamVjdF9rZXlzID0gT2JqZWN0LmtleXMgfHwgZnVuY3Rpb24gKG9iaikge1xuICAgIHZhciByZXMgPSBbXTtcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSByZXMucHVzaChrZXkpO1xuICAgIHJldHVybiByZXM7XG59O1xuXG52YXIgT2JqZWN0X2dldE93blByb3BlcnR5TmFtZXMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyB8fCBmdW5jdGlvbiAob2JqKSB7XG4gICAgdmFyIHJlcyA9IFtdO1xuICAgIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICAgICAgaWYgKE9iamVjdC5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwga2V5KSkgcmVzLnB1c2goa2V5KTtcbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbn07XG5cbnZhciBPYmplY3RfY3JlYXRlID0gT2JqZWN0LmNyZWF0ZSB8fCBmdW5jdGlvbiAocHJvdG90eXBlLCBwcm9wZXJ0aWVzKSB7XG4gICAgLy8gZnJvbSBlczUtc2hpbVxuICAgIHZhciBvYmplY3Q7XG4gICAgaWYgKHByb3RvdHlwZSA9PT0gbnVsbCkge1xuICAgICAgICBvYmplY3QgPSB7ICdfX3Byb3RvX18nIDogbnVsbCB9O1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgaWYgKHR5cGVvZiBwcm90b3R5cGUgIT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgICAgICAgICAgICd0eXBlb2YgcHJvdG90eXBlWycgKyAodHlwZW9mIHByb3RvdHlwZSkgKyAnXSAhPSBcXCdvYmplY3RcXCcnXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIHZhciBUeXBlID0gZnVuY3Rpb24gKCkge307XG4gICAgICAgIFR5cGUucHJvdG90eXBlID0gcHJvdG90eXBlO1xuICAgICAgICBvYmplY3QgPSBuZXcgVHlwZSgpO1xuICAgICAgICBvYmplY3QuX19wcm90b19fID0gcHJvdG90eXBlO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIHByb3BlcnRpZXMgIT09ICd1bmRlZmluZWQnICYmIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKSB7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKG9iamVjdCwgcHJvcGVydGllcyk7XG4gICAgfVxuICAgIHJldHVybiBvYmplY3Q7XG59O1xuXG5leHBvcnRzLmluaGVyaXRzID0gZnVuY3Rpb24oY3Rvciwgc3VwZXJDdG9yKSB7XG4gIGN0b3Iuc3VwZXJfID0gc3VwZXJDdG9yO1xuICBjdG9yLnByb3RvdHlwZSA9IE9iamVjdF9jcmVhdGUoc3VwZXJDdG9yLnByb3RvdHlwZSwge1xuICAgIGNvbnN0cnVjdG9yOiB7XG4gICAgICB2YWx1ZTogY3RvcixcbiAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9XG4gIH0pO1xufTtcblxudmFyIGZvcm1hdFJlZ0V4cCA9IC8lW3NkaiVdL2c7XG5leHBvcnRzLmZvcm1hdCA9IGZ1bmN0aW9uKGYpIHtcbiAgaWYgKHR5cGVvZiBmICE9PSAnc3RyaW5nJykge1xuICAgIHZhciBvYmplY3RzID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIG9iamVjdHMucHVzaChleHBvcnRzLmluc3BlY3QoYXJndW1lbnRzW2ldKSk7XG4gICAgfVxuICAgIHJldHVybiBvYmplY3RzLmpvaW4oJyAnKTtcbiAgfVxuXG4gIHZhciBpID0gMTtcbiAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gIHZhciBsZW4gPSBhcmdzLmxlbmd0aDtcbiAgdmFyIHN0ciA9IFN0cmluZyhmKS5yZXBsYWNlKGZvcm1hdFJlZ0V4cCwgZnVuY3Rpb24oeCkge1xuICAgIGlmICh4ID09PSAnJSUnKSByZXR1cm4gJyUnO1xuICAgIGlmIChpID49IGxlbikgcmV0dXJuIHg7XG4gICAgc3dpdGNoICh4KSB7XG4gICAgICBjYXNlICclcyc6IHJldHVybiBTdHJpbmcoYXJnc1tpKytdKTtcbiAgICAgIGNhc2UgJyVkJzogcmV0dXJuIE51bWJlcihhcmdzW2krK10pO1xuICAgICAgY2FzZSAnJWonOiByZXR1cm4gSlNPTi5zdHJpbmdpZnkoYXJnc1tpKytdKTtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiB4O1xuICAgIH1cbiAgfSk7XG4gIGZvcih2YXIgeCA9IGFyZ3NbaV07IGkgPCBsZW47IHggPSBhcmdzWysraV0pe1xuICAgIGlmICh4ID09PSBudWxsIHx8IHR5cGVvZiB4ICE9PSAnb2JqZWN0Jykge1xuICAgICAgc3RyICs9ICcgJyArIHg7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0ciArPSAnICcgKyBleHBvcnRzLmluc3BlY3QoeCk7XG4gICAgfVxuICB9XG4gIHJldHVybiBzdHI7XG59O1xuIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG5cbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxucHJvY2Vzcy5uZXh0VGljayA9IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNhblNldEltbWVkaWF0ZSA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnNldEltbWVkaWF0ZTtcbiAgICB2YXIgY2FuUG9zdCA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnBvc3RNZXNzYWdlICYmIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyXG4gICAgO1xuXG4gICAgaWYgKGNhblNldEltbWVkaWF0ZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGYpIHsgcmV0dXJuIHdpbmRvdy5zZXRJbW1lZGlhdGUoZikgfTtcbiAgICB9XG5cbiAgICBpZiAoY2FuUG9zdCkge1xuICAgICAgICB2YXIgcXVldWUgPSBbXTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBmdW5jdGlvbiAoZXYpIHtcbiAgICAgICAgICAgIGlmIChldi5zb3VyY2UgPT09IHdpbmRvdyAmJiBldi5kYXRhID09PSAncHJvY2Vzcy10aWNrJykge1xuICAgICAgICAgICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgIGlmIChxdWV1ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBmbiA9IHF1ZXVlLnNoaWZ0KCk7XG4gICAgICAgICAgICAgICAgICAgIGZuKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LCB0cnVlKTtcblxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcbiAgICAgICAgICAgIHF1ZXVlLnB1c2goZm4pO1xuICAgICAgICAgICAgd2luZG93LnBvc3RNZXNzYWdlKCdwcm9jZXNzLXRpY2snLCAnKicpO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICBzZXRUaW1lb3V0KGZuLCAwKTtcbiAgICB9O1xufSkoKTtcblxucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufVxuXG4vLyBUT0RPKHNodHlsbWFuKVxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG4iLCIvLyAgICAgVW5kZXJzY29yZS5qcyAxLjQuNFxuLy8gICAgIGh0dHA6Ly91bmRlcnNjb3JlanMub3JnXG4vLyAgICAgKGMpIDIwMDktMjAxMyBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgSW5jLlxuLy8gICAgIFVuZGVyc2NvcmUgbWF5IGJlIGZyZWVseSBkaXN0cmlidXRlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuXG5cbihmdW5jdGlvbigpIHtcblxuICAvLyBCYXNlbGluZSBzZXR1cFxuICAvLyAtLS0tLS0tLS0tLS0tLVxuXG4gIC8vIEVzdGFibGlzaCB0aGUgcm9vdCBvYmplY3QsIGB3aW5kb3dgIGluIHRoZSBicm93c2VyLCBvciBgZ2xvYmFsYCBvbiB0aGUgc2VydmVyLlxuICB2YXIgcm9vdCA9IHRoaXM7XG5cbiAgLy8gU2F2ZSB0aGUgcHJldmlvdXMgdmFsdWUgb2YgdGhlIGBfYCB2YXJpYWJsZS5cbiAgdmFyIHByZXZpb3VzVW5kZXJzY29yZSA9IHJvb3QuXztcblxuICAvLyBFc3RhYmxpc2ggdGhlIG9iamVjdCB0aGF0IGdldHMgcmV0dXJuZWQgdG8gYnJlYWsgb3V0IG9mIGEgbG9vcCBpdGVyYXRpb24uXG4gIHZhciBicmVha2VyID0ge307XG5cbiAgLy8gU2F2ZSBieXRlcyBpbiB0aGUgbWluaWZpZWQgKGJ1dCBub3QgZ3ppcHBlZCkgdmVyc2lvbjpcbiAgdmFyIEFycmF5UHJvdG8gPSBBcnJheS5wcm90b3R5cGUsIE9ialByb3RvID0gT2JqZWN0LnByb3RvdHlwZSwgRnVuY1Byb3RvID0gRnVuY3Rpb24ucHJvdG90eXBlO1xuXG4gIC8vIENyZWF0ZSBxdWljayByZWZlcmVuY2UgdmFyaWFibGVzIGZvciBzcGVlZCBhY2Nlc3MgdG8gY29yZSBwcm90b3R5cGVzLlxuICB2YXIgcHVzaCAgICAgICAgICAgICA9IEFycmF5UHJvdG8ucHVzaCxcbiAgICAgIHNsaWNlICAgICAgICAgICAgPSBBcnJheVByb3RvLnNsaWNlLFxuICAgICAgY29uY2F0ICAgICAgICAgICA9IEFycmF5UHJvdG8uY29uY2F0LFxuICAgICAgdG9TdHJpbmcgICAgICAgICA9IE9ialByb3RvLnRvU3RyaW5nLFxuICAgICAgaGFzT3duUHJvcGVydHkgICA9IE9ialByb3RvLmhhc093blByb3BlcnR5O1xuXG4gIC8vIEFsbCAqKkVDTUFTY3JpcHQgNSoqIG5hdGl2ZSBmdW5jdGlvbiBpbXBsZW1lbnRhdGlvbnMgdGhhdCB3ZSBob3BlIHRvIHVzZVxuICAvLyBhcmUgZGVjbGFyZWQgaGVyZS5cbiAgdmFyXG4gICAgbmF0aXZlRm9yRWFjaCAgICAgID0gQXJyYXlQcm90by5mb3JFYWNoLFxuICAgIG5hdGl2ZU1hcCAgICAgICAgICA9IEFycmF5UHJvdG8ubWFwLFxuICAgIG5hdGl2ZVJlZHVjZSAgICAgICA9IEFycmF5UHJvdG8ucmVkdWNlLFxuICAgIG5hdGl2ZVJlZHVjZVJpZ2h0ICA9IEFycmF5UHJvdG8ucmVkdWNlUmlnaHQsXG4gICAgbmF0aXZlRmlsdGVyICAgICAgID0gQXJyYXlQcm90by5maWx0ZXIsXG4gICAgbmF0aXZlRXZlcnkgICAgICAgID0gQXJyYXlQcm90by5ldmVyeSxcbiAgICBuYXRpdmVTb21lICAgICAgICAgPSBBcnJheVByb3RvLnNvbWUsXG4gICAgbmF0aXZlSW5kZXhPZiAgICAgID0gQXJyYXlQcm90by5pbmRleE9mLFxuICAgIG5hdGl2ZUxhc3RJbmRleE9mICA9IEFycmF5UHJvdG8ubGFzdEluZGV4T2YsXG4gICAgbmF0aXZlSXNBcnJheSAgICAgID0gQXJyYXkuaXNBcnJheSxcbiAgICBuYXRpdmVLZXlzICAgICAgICAgPSBPYmplY3Qua2V5cyxcbiAgICBuYXRpdmVCaW5kICAgICAgICAgPSBGdW5jUHJvdG8uYmluZDtcblxuICAvLyBDcmVhdGUgYSBzYWZlIHJlZmVyZW5jZSB0byB0aGUgVW5kZXJzY29yZSBvYmplY3QgZm9yIHVzZSBiZWxvdy5cbiAgdmFyIF8gPSBmdW5jdGlvbihvYmopIHtcbiAgICBpZiAob2JqIGluc3RhbmNlb2YgXykgcmV0dXJuIG9iajtcbiAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgXykpIHJldHVybiBuZXcgXyhvYmopO1xuICAgIHRoaXMuX3dyYXBwZWQgPSBvYmo7XG4gIH07XG5cbiAgLy8gRXhwb3J0IHRoZSBVbmRlcnNjb3JlIG9iamVjdCBmb3IgKipOb2RlLmpzKiosIHdpdGhcbiAgLy8gYmFja3dhcmRzLWNvbXBhdGliaWxpdHkgZm9yIHRoZSBvbGQgYHJlcXVpcmUoKWAgQVBJLiBJZiB3ZSdyZSBpblxuICAvLyB0aGUgYnJvd3NlciwgYWRkIGBfYCBhcyBhIGdsb2JhbCBvYmplY3QgdmlhIGEgc3RyaW5nIGlkZW50aWZpZXIsXG4gIC8vIGZvciBDbG9zdXJlIENvbXBpbGVyIFwiYWR2YW5jZWRcIiBtb2RlLlxuICBpZiAodHlwZW9mIGV4cG9ydHMgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gICAgICBleHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSBfO1xuICAgIH1cbiAgICBleHBvcnRzLl8gPSBfO1xuICB9IGVsc2Uge1xuICAgIHJvb3QuXyA9IF87XG4gIH1cblxuICAvLyBDdXJyZW50IHZlcnNpb24uXG4gIF8uVkVSU0lPTiA9ICcxLjQuNCc7XG5cbiAgLy8gQ29sbGVjdGlvbiBGdW5jdGlvbnNcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvLyBUaGUgY29ybmVyc3RvbmUsIGFuIGBlYWNoYCBpbXBsZW1lbnRhdGlvbiwgYWthIGBmb3JFYWNoYC5cbiAgLy8gSGFuZGxlcyBvYmplY3RzIHdpdGggdGhlIGJ1aWx0LWluIGBmb3JFYWNoYCwgYXJyYXlzLCBhbmQgcmF3IG9iamVjdHMuXG4gIC8vIERlbGVnYXRlcyB0byAqKkVDTUFTY3JpcHQgNSoqJ3MgbmF0aXZlIGBmb3JFYWNoYCBpZiBhdmFpbGFibGUuXG4gIHZhciBlYWNoID0gXy5lYWNoID0gXy5mb3JFYWNoID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRvciwgY29udGV4dCkge1xuICAgIGlmIChvYmogPT0gbnVsbCkgcmV0dXJuO1xuICAgIGlmIChuYXRpdmVGb3JFYWNoICYmIG9iai5mb3JFYWNoID09PSBuYXRpdmVGb3JFYWNoKSB7XG4gICAgICBvYmouZm9yRWFjaChpdGVyYXRvciwgY29udGV4dCk7XG4gICAgfSBlbHNlIGlmIChvYmoubGVuZ3RoID09PSArb2JqLmxlbmd0aCkge1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBvYmoubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIGlmIChpdGVyYXRvci5jYWxsKGNvbnRleHQsIG9ialtpXSwgaSwgb2JqKSA9PT0gYnJlYWtlcikgcmV0dXJuO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgICAgIGlmIChfLmhhcyhvYmosIGtleSkpIHtcbiAgICAgICAgICBpZiAoaXRlcmF0b3IuY2FsbChjb250ZXh0LCBvYmpba2V5XSwga2V5LCBvYmopID09PSBicmVha2VyKSByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgLy8gUmV0dXJuIHRoZSByZXN1bHRzIG9mIGFwcGx5aW5nIHRoZSBpdGVyYXRvciB0byBlYWNoIGVsZW1lbnQuXG4gIC8vIERlbGVnYXRlcyB0byAqKkVDTUFTY3JpcHQgNSoqJ3MgbmF0aXZlIGBtYXBgIGlmIGF2YWlsYWJsZS5cbiAgXy5tYXAgPSBfLmNvbGxlY3QgPSBmdW5jdGlvbihvYmosIGl0ZXJhdG9yLCBjb250ZXh0KSB7XG4gICAgdmFyIHJlc3VsdHMgPSBbXTtcbiAgICBpZiAob2JqID09IG51bGwpIHJldHVybiByZXN1bHRzO1xuICAgIGlmIChuYXRpdmVNYXAgJiYgb2JqLm1hcCA9PT0gbmF0aXZlTWFwKSByZXR1cm4gb2JqLm1hcChpdGVyYXRvciwgY29udGV4dCk7XG4gICAgZWFjaChvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgbGlzdCkge1xuICAgICAgcmVzdWx0c1tyZXN1bHRzLmxlbmd0aF0gPSBpdGVyYXRvci5jYWxsKGNvbnRleHQsIHZhbHVlLCBpbmRleCwgbGlzdCk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH07XG5cbiAgdmFyIHJlZHVjZUVycm9yID0gJ1JlZHVjZSBvZiBlbXB0eSBhcnJheSB3aXRoIG5vIGluaXRpYWwgdmFsdWUnO1xuXG4gIC8vICoqUmVkdWNlKiogYnVpbGRzIHVwIGEgc2luZ2xlIHJlc3VsdCBmcm9tIGEgbGlzdCBvZiB2YWx1ZXMsIGFrYSBgaW5qZWN0YCxcbiAgLy8gb3IgYGZvbGRsYC4gRGVsZWdhdGVzIHRvICoqRUNNQVNjcmlwdCA1KioncyBuYXRpdmUgYHJlZHVjZWAgaWYgYXZhaWxhYmxlLlxuICBfLnJlZHVjZSA9IF8uZm9sZGwgPSBfLmluamVjdCA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0b3IsIG1lbW8sIGNvbnRleHQpIHtcbiAgICB2YXIgaW5pdGlhbCA9IGFyZ3VtZW50cy5sZW5ndGggPiAyO1xuICAgIGlmIChvYmogPT0gbnVsbCkgb2JqID0gW107XG4gICAgaWYgKG5hdGl2ZVJlZHVjZSAmJiBvYmoucmVkdWNlID09PSBuYXRpdmVSZWR1Y2UpIHtcbiAgICAgIGlmIChjb250ZXh0KSBpdGVyYXRvciA9IF8uYmluZChpdGVyYXRvciwgY29udGV4dCk7XG4gICAgICByZXR1cm4gaW5pdGlhbCA/IG9iai5yZWR1Y2UoaXRlcmF0b3IsIG1lbW8pIDogb2JqLnJlZHVjZShpdGVyYXRvcik7XG4gICAgfVxuICAgIGVhY2gob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGxpc3QpIHtcbiAgICAgIGlmICghaW5pdGlhbCkge1xuICAgICAgICBtZW1vID0gdmFsdWU7XG4gICAgICAgIGluaXRpYWwgPSB0cnVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbWVtbyA9IGl0ZXJhdG9yLmNhbGwoY29udGV4dCwgbWVtbywgdmFsdWUsIGluZGV4LCBsaXN0KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBpZiAoIWluaXRpYWwpIHRocm93IG5ldyBUeXBlRXJyb3IocmVkdWNlRXJyb3IpO1xuICAgIHJldHVybiBtZW1vO1xuICB9O1xuXG4gIC8vIFRoZSByaWdodC1hc3NvY2lhdGl2ZSB2ZXJzaW9uIG9mIHJlZHVjZSwgYWxzbyBrbm93biBhcyBgZm9sZHJgLlxuICAvLyBEZWxlZ2F0ZXMgdG8gKipFQ01BU2NyaXB0IDUqKidzIG5hdGl2ZSBgcmVkdWNlUmlnaHRgIGlmIGF2YWlsYWJsZS5cbiAgXy5yZWR1Y2VSaWdodCA9IF8uZm9sZHIgPSBmdW5jdGlvbihvYmosIGl0ZXJhdG9yLCBtZW1vLCBjb250ZXh0KSB7XG4gICAgdmFyIGluaXRpYWwgPSBhcmd1bWVudHMubGVuZ3RoID4gMjtcbiAgICBpZiAob2JqID09IG51bGwpIG9iaiA9IFtdO1xuICAgIGlmIChuYXRpdmVSZWR1Y2VSaWdodCAmJiBvYmoucmVkdWNlUmlnaHQgPT09IG5hdGl2ZVJlZHVjZVJpZ2h0KSB7XG4gICAgICBpZiAoY29udGV4dCkgaXRlcmF0b3IgPSBfLmJpbmQoaXRlcmF0b3IsIGNvbnRleHQpO1xuICAgICAgcmV0dXJuIGluaXRpYWwgPyBvYmoucmVkdWNlUmlnaHQoaXRlcmF0b3IsIG1lbW8pIDogb2JqLnJlZHVjZVJpZ2h0KGl0ZXJhdG9yKTtcbiAgICB9XG4gICAgdmFyIGxlbmd0aCA9IG9iai5sZW5ndGg7XG4gICAgaWYgKGxlbmd0aCAhPT0gK2xlbmd0aCkge1xuICAgICAgdmFyIGtleXMgPSBfLmtleXMob2JqKTtcbiAgICAgIGxlbmd0aCA9IGtleXMubGVuZ3RoO1xuICAgIH1cbiAgICBlYWNoKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBsaXN0KSB7XG4gICAgICBpbmRleCA9IGtleXMgPyBrZXlzWy0tbGVuZ3RoXSA6IC0tbGVuZ3RoO1xuICAgICAgaWYgKCFpbml0aWFsKSB7XG4gICAgICAgIG1lbW8gPSBvYmpbaW5kZXhdO1xuICAgICAgICBpbml0aWFsID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG1lbW8gPSBpdGVyYXRvci5jYWxsKGNvbnRleHQsIG1lbW8sIG9ialtpbmRleF0sIGluZGV4LCBsaXN0KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBpZiAoIWluaXRpYWwpIHRocm93IG5ldyBUeXBlRXJyb3IocmVkdWNlRXJyb3IpO1xuICAgIHJldHVybiBtZW1vO1xuICB9O1xuXG4gIC8vIFJldHVybiB0aGUgZmlyc3QgdmFsdWUgd2hpY2ggcGFzc2VzIGEgdHJ1dGggdGVzdC4gQWxpYXNlZCBhcyBgZGV0ZWN0YC5cbiAgXy5maW5kID0gXy5kZXRlY3QgPSBmdW5jdGlvbihvYmosIGl0ZXJhdG9yLCBjb250ZXh0KSB7XG4gICAgdmFyIHJlc3VsdDtcbiAgICBhbnkob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGxpc3QpIHtcbiAgICAgIGlmIChpdGVyYXRvci5jYWxsKGNvbnRleHQsIHZhbHVlLCBpbmRleCwgbGlzdCkpIHtcbiAgICAgICAgcmVzdWx0ID0gdmFsdWU7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgLy8gUmV0dXJuIGFsbCB0aGUgZWxlbWVudHMgdGhhdCBwYXNzIGEgdHJ1dGggdGVzdC5cbiAgLy8gRGVsZWdhdGVzIHRvICoqRUNNQVNjcmlwdCA1KioncyBuYXRpdmUgYGZpbHRlcmAgaWYgYXZhaWxhYmxlLlxuICAvLyBBbGlhc2VkIGFzIGBzZWxlY3RgLlxuICBfLmZpbHRlciA9IF8uc2VsZWN0ID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRvciwgY29udGV4dCkge1xuICAgIHZhciByZXN1bHRzID0gW107XG4gICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gcmVzdWx0cztcbiAgICBpZiAobmF0aXZlRmlsdGVyICYmIG9iai5maWx0ZXIgPT09IG5hdGl2ZUZpbHRlcikgcmV0dXJuIG9iai5maWx0ZXIoaXRlcmF0b3IsIGNvbnRleHQpO1xuICAgIGVhY2gob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGxpc3QpIHtcbiAgICAgIGlmIChpdGVyYXRvci5jYWxsKGNvbnRleHQsIHZhbHVlLCBpbmRleCwgbGlzdCkpIHJlc3VsdHNbcmVzdWx0cy5sZW5ndGhdID0gdmFsdWU7XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH07XG5cbiAgLy8gUmV0dXJuIGFsbCB0aGUgZWxlbWVudHMgZm9yIHdoaWNoIGEgdHJ1dGggdGVzdCBmYWlscy5cbiAgXy5yZWplY3QgPSBmdW5jdGlvbihvYmosIGl0ZXJhdG9yLCBjb250ZXh0KSB7XG4gICAgcmV0dXJuIF8uZmlsdGVyKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBsaXN0KSB7XG4gICAgICByZXR1cm4gIWl0ZXJhdG9yLmNhbGwoY29udGV4dCwgdmFsdWUsIGluZGV4LCBsaXN0KTtcbiAgICB9LCBjb250ZXh0KTtcbiAgfTtcblxuICAvLyBEZXRlcm1pbmUgd2hldGhlciBhbGwgb2YgdGhlIGVsZW1lbnRzIG1hdGNoIGEgdHJ1dGggdGVzdC5cbiAgLy8gRGVsZWdhdGVzIHRvICoqRUNNQVNjcmlwdCA1KioncyBuYXRpdmUgYGV2ZXJ5YCBpZiBhdmFpbGFibGUuXG4gIC8vIEFsaWFzZWQgYXMgYGFsbGAuXG4gIF8uZXZlcnkgPSBfLmFsbCA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0b3IsIGNvbnRleHQpIHtcbiAgICBpdGVyYXRvciB8fCAoaXRlcmF0b3IgPSBfLmlkZW50aXR5KTtcbiAgICB2YXIgcmVzdWx0ID0gdHJ1ZTtcbiAgICBpZiAob2JqID09IG51bGwpIHJldHVybiByZXN1bHQ7XG4gICAgaWYgKG5hdGl2ZUV2ZXJ5ICYmIG9iai5ldmVyeSA9PT0gbmF0aXZlRXZlcnkpIHJldHVybiBvYmouZXZlcnkoaXRlcmF0b3IsIGNvbnRleHQpO1xuICAgIGVhY2gob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGxpc3QpIHtcbiAgICAgIGlmICghKHJlc3VsdCA9IHJlc3VsdCAmJiBpdGVyYXRvci5jYWxsKGNvbnRleHQsIHZhbHVlLCBpbmRleCwgbGlzdCkpKSByZXR1cm4gYnJlYWtlcjtcbiAgICB9KTtcbiAgICByZXR1cm4gISFyZXN1bHQ7XG4gIH07XG5cbiAgLy8gRGV0ZXJtaW5lIGlmIGF0IGxlYXN0IG9uZSBlbGVtZW50IGluIHRoZSBvYmplY3QgbWF0Y2hlcyBhIHRydXRoIHRlc3QuXG4gIC8vIERlbGVnYXRlcyB0byAqKkVDTUFTY3JpcHQgNSoqJ3MgbmF0aXZlIGBzb21lYCBpZiBhdmFpbGFibGUuXG4gIC8vIEFsaWFzZWQgYXMgYGFueWAuXG4gIHZhciBhbnkgPSBfLnNvbWUgPSBfLmFueSA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0b3IsIGNvbnRleHQpIHtcbiAgICBpdGVyYXRvciB8fCAoaXRlcmF0b3IgPSBfLmlkZW50aXR5KTtcbiAgICB2YXIgcmVzdWx0ID0gZmFsc2U7XG4gICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gcmVzdWx0O1xuICAgIGlmIChuYXRpdmVTb21lICYmIG9iai5zb21lID09PSBuYXRpdmVTb21lKSByZXR1cm4gb2JqLnNvbWUoaXRlcmF0b3IsIGNvbnRleHQpO1xuICAgIGVhY2gob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGxpc3QpIHtcbiAgICAgIGlmIChyZXN1bHQgfHwgKHJlc3VsdCA9IGl0ZXJhdG9yLmNhbGwoY29udGV4dCwgdmFsdWUsIGluZGV4LCBsaXN0KSkpIHJldHVybiBicmVha2VyO1xuICAgIH0pO1xuICAgIHJldHVybiAhIXJlc3VsdDtcbiAgfTtcblxuICAvLyBEZXRlcm1pbmUgaWYgdGhlIGFycmF5IG9yIG9iamVjdCBjb250YWlucyBhIGdpdmVuIHZhbHVlICh1c2luZyBgPT09YCkuXG4gIC8vIEFsaWFzZWQgYXMgYGluY2x1ZGVgLlxuICBfLmNvbnRhaW5zID0gXy5pbmNsdWRlID0gZnVuY3Rpb24ob2JqLCB0YXJnZXQpIHtcbiAgICBpZiAob2JqID09IG51bGwpIHJldHVybiBmYWxzZTtcbiAgICBpZiAobmF0aXZlSW5kZXhPZiAmJiBvYmouaW5kZXhPZiA9PT0gbmF0aXZlSW5kZXhPZikgcmV0dXJuIG9iai5pbmRleE9mKHRhcmdldCkgIT0gLTE7XG4gICAgcmV0dXJuIGFueShvYmosIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICByZXR1cm4gdmFsdWUgPT09IHRhcmdldDtcbiAgICB9KTtcbiAgfTtcblxuICAvLyBJbnZva2UgYSBtZXRob2QgKHdpdGggYXJndW1lbnRzKSBvbiBldmVyeSBpdGVtIGluIGEgY29sbGVjdGlvbi5cbiAgXy5pbnZva2UgPSBmdW5jdGlvbihvYmosIG1ldGhvZCkge1xuICAgIHZhciBhcmdzID0gc2xpY2UuY2FsbChhcmd1bWVudHMsIDIpO1xuICAgIHZhciBpc0Z1bmMgPSBfLmlzRnVuY3Rpb24obWV0aG9kKTtcbiAgICByZXR1cm4gXy5tYXAob2JqLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgcmV0dXJuIChpc0Z1bmMgPyBtZXRob2QgOiB2YWx1ZVttZXRob2RdKS5hcHBseSh2YWx1ZSwgYXJncyk7XG4gICAgfSk7XG4gIH07XG5cbiAgLy8gQ29udmVuaWVuY2UgdmVyc2lvbiBvZiBhIGNvbW1vbiB1c2UgY2FzZSBvZiBgbWFwYDogZmV0Y2hpbmcgYSBwcm9wZXJ0eS5cbiAgXy5wbHVjayA9IGZ1bmN0aW9uKG9iaiwga2V5KSB7XG4gICAgcmV0dXJuIF8ubWFwKG9iaiwgZnVuY3Rpb24odmFsdWUpeyByZXR1cm4gdmFsdWVba2V5XTsgfSk7XG4gIH07XG5cbiAgLy8gQ29udmVuaWVuY2UgdmVyc2lvbiBvZiBhIGNvbW1vbiB1c2UgY2FzZSBvZiBgZmlsdGVyYDogc2VsZWN0aW5nIG9ubHkgb2JqZWN0c1xuICAvLyBjb250YWluaW5nIHNwZWNpZmljIGBrZXk6dmFsdWVgIHBhaXJzLlxuICBfLndoZXJlID0gZnVuY3Rpb24ob2JqLCBhdHRycywgZmlyc3QpIHtcbiAgICBpZiAoXy5pc0VtcHR5KGF0dHJzKSkgcmV0dXJuIGZpcnN0ID8gbnVsbCA6IFtdO1xuICAgIHJldHVybiBfW2ZpcnN0ID8gJ2ZpbmQnIDogJ2ZpbHRlciddKG9iaiwgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIGZvciAodmFyIGtleSBpbiBhdHRycykge1xuICAgICAgICBpZiAoYXR0cnNba2V5XSAhPT0gdmFsdWVba2V5XSkgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSk7XG4gIH07XG5cbiAgLy8gQ29udmVuaWVuY2UgdmVyc2lvbiBvZiBhIGNvbW1vbiB1c2UgY2FzZSBvZiBgZmluZGA6IGdldHRpbmcgdGhlIGZpcnN0IG9iamVjdFxuICAvLyBjb250YWluaW5nIHNwZWNpZmljIGBrZXk6dmFsdWVgIHBhaXJzLlxuICBfLmZpbmRXaGVyZSA9IGZ1bmN0aW9uKG9iaiwgYXR0cnMpIHtcbiAgICByZXR1cm4gXy53aGVyZShvYmosIGF0dHJzLCB0cnVlKTtcbiAgfTtcblxuICAvLyBSZXR1cm4gdGhlIG1heGltdW0gZWxlbWVudCBvciAoZWxlbWVudC1iYXNlZCBjb21wdXRhdGlvbikuXG4gIC8vIENhbid0IG9wdGltaXplIGFycmF5cyBvZiBpbnRlZ2VycyBsb25nZXIgdGhhbiA2NSw1MzUgZWxlbWVudHMuXG4gIC8vIFNlZTogaHR0cHM6Ly9idWdzLndlYmtpdC5vcmcvc2hvd19idWcuY2dpP2lkPTgwNzk3XG4gIF8ubWF4ID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRvciwgY29udGV4dCkge1xuICAgIGlmICghaXRlcmF0b3IgJiYgXy5pc0FycmF5KG9iaikgJiYgb2JqWzBdID09PSArb2JqWzBdICYmIG9iai5sZW5ndGggPCA2NTUzNSkge1xuICAgICAgcmV0dXJuIE1hdGgubWF4LmFwcGx5KE1hdGgsIG9iaik7XG4gICAgfVxuICAgIGlmICghaXRlcmF0b3IgJiYgXy5pc0VtcHR5KG9iaikpIHJldHVybiAtSW5maW5pdHk7XG4gICAgdmFyIHJlc3VsdCA9IHtjb21wdXRlZCA6IC1JbmZpbml0eSwgdmFsdWU6IC1JbmZpbml0eX07XG4gICAgZWFjaChvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgbGlzdCkge1xuICAgICAgdmFyIGNvbXB1dGVkID0gaXRlcmF0b3IgPyBpdGVyYXRvci5jYWxsKGNvbnRleHQsIHZhbHVlLCBpbmRleCwgbGlzdCkgOiB2YWx1ZTtcbiAgICAgIGNvbXB1dGVkID49IHJlc3VsdC5jb21wdXRlZCAmJiAocmVzdWx0ID0ge3ZhbHVlIDogdmFsdWUsIGNvbXB1dGVkIDogY29tcHV0ZWR9KTtcbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0LnZhbHVlO1xuICB9O1xuXG4gIC8vIFJldHVybiB0aGUgbWluaW11bSBlbGVtZW50IChvciBlbGVtZW50LWJhc2VkIGNvbXB1dGF0aW9uKS5cbiAgXy5taW4gPSBmdW5jdGlvbihvYmosIGl0ZXJhdG9yLCBjb250ZXh0KSB7XG4gICAgaWYgKCFpdGVyYXRvciAmJiBfLmlzQXJyYXkob2JqKSAmJiBvYmpbMF0gPT09ICtvYmpbMF0gJiYgb2JqLmxlbmd0aCA8IDY1NTM1KSB7XG4gICAgICByZXR1cm4gTWF0aC5taW4uYXBwbHkoTWF0aCwgb2JqKTtcbiAgICB9XG4gICAgaWYgKCFpdGVyYXRvciAmJiBfLmlzRW1wdHkob2JqKSkgcmV0dXJuIEluZmluaXR5O1xuICAgIHZhciByZXN1bHQgPSB7Y29tcHV0ZWQgOiBJbmZpbml0eSwgdmFsdWU6IEluZmluaXR5fTtcbiAgICBlYWNoKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBsaXN0KSB7XG4gICAgICB2YXIgY29tcHV0ZWQgPSBpdGVyYXRvciA/IGl0ZXJhdG9yLmNhbGwoY29udGV4dCwgdmFsdWUsIGluZGV4LCBsaXN0KSA6IHZhbHVlO1xuICAgICAgY29tcHV0ZWQgPCByZXN1bHQuY29tcHV0ZWQgJiYgKHJlc3VsdCA9IHt2YWx1ZSA6IHZhbHVlLCBjb21wdXRlZCA6IGNvbXB1dGVkfSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdC52YWx1ZTtcbiAgfTtcblxuICAvLyBTaHVmZmxlIGFuIGFycmF5LlxuICBfLnNodWZmbGUgPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIgcmFuZDtcbiAgICB2YXIgaW5kZXggPSAwO1xuICAgIHZhciBzaHVmZmxlZCA9IFtdO1xuICAgIGVhY2gob2JqLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgcmFuZCA9IF8ucmFuZG9tKGluZGV4KyspO1xuICAgICAgc2h1ZmZsZWRbaW5kZXggLSAxXSA9IHNodWZmbGVkW3JhbmRdO1xuICAgICAgc2h1ZmZsZWRbcmFuZF0gPSB2YWx1ZTtcbiAgICB9KTtcbiAgICByZXR1cm4gc2h1ZmZsZWQ7XG4gIH07XG5cbiAgLy8gQW4gaW50ZXJuYWwgZnVuY3Rpb24gdG8gZ2VuZXJhdGUgbG9va3VwIGl0ZXJhdG9ycy5cbiAgdmFyIGxvb2t1cEl0ZXJhdG9yID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICByZXR1cm4gXy5pc0Z1bmN0aW9uKHZhbHVlKSA/IHZhbHVlIDogZnVuY3Rpb24ob2JqKXsgcmV0dXJuIG9ialt2YWx1ZV07IH07XG4gIH07XG5cbiAgLy8gU29ydCB0aGUgb2JqZWN0J3MgdmFsdWVzIGJ5IGEgY3JpdGVyaW9uIHByb2R1Y2VkIGJ5IGFuIGl0ZXJhdG9yLlxuICBfLnNvcnRCeSA9IGZ1bmN0aW9uKG9iaiwgdmFsdWUsIGNvbnRleHQpIHtcbiAgICB2YXIgaXRlcmF0b3IgPSBsb29rdXBJdGVyYXRvcih2YWx1ZSk7XG4gICAgcmV0dXJuIF8ucGx1Y2soXy5tYXAob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGxpc3QpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHZhbHVlIDogdmFsdWUsXG4gICAgICAgIGluZGV4IDogaW5kZXgsXG4gICAgICAgIGNyaXRlcmlhIDogaXRlcmF0b3IuY2FsbChjb250ZXh0LCB2YWx1ZSwgaW5kZXgsIGxpc3QpXG4gICAgICB9O1xuICAgIH0pLnNvcnQoZnVuY3Rpb24obGVmdCwgcmlnaHQpIHtcbiAgICAgIHZhciBhID0gbGVmdC5jcml0ZXJpYTtcbiAgICAgIHZhciBiID0gcmlnaHQuY3JpdGVyaWE7XG4gICAgICBpZiAoYSAhPT0gYikge1xuICAgICAgICBpZiAoYSA+IGIgfHwgYSA9PT0gdm9pZCAwKSByZXR1cm4gMTtcbiAgICAgICAgaWYgKGEgPCBiIHx8IGIgPT09IHZvaWQgMCkgcmV0dXJuIC0xO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGxlZnQuaW5kZXggPCByaWdodC5pbmRleCA/IC0xIDogMTtcbiAgICB9KSwgJ3ZhbHVlJyk7XG4gIH07XG5cbiAgLy8gQW4gaW50ZXJuYWwgZnVuY3Rpb24gdXNlZCBmb3IgYWdncmVnYXRlIFwiZ3JvdXAgYnlcIiBvcGVyYXRpb25zLlxuICB2YXIgZ3JvdXAgPSBmdW5jdGlvbihvYmosIHZhbHVlLCBjb250ZXh0LCBiZWhhdmlvcikge1xuICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICB2YXIgaXRlcmF0b3IgPSBsb29rdXBJdGVyYXRvcih2YWx1ZSB8fCBfLmlkZW50aXR5KTtcbiAgICBlYWNoKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4KSB7XG4gICAgICB2YXIga2V5ID0gaXRlcmF0b3IuY2FsbChjb250ZXh0LCB2YWx1ZSwgaW5kZXgsIG9iaik7XG4gICAgICBiZWhhdmlvcihyZXN1bHQsIGtleSwgdmFsdWUpO1xuICAgIH0pO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgLy8gR3JvdXBzIHRoZSBvYmplY3QncyB2YWx1ZXMgYnkgYSBjcml0ZXJpb24uIFBhc3MgZWl0aGVyIGEgc3RyaW5nIGF0dHJpYnV0ZVxuICAvLyB0byBncm91cCBieSwgb3IgYSBmdW5jdGlvbiB0aGF0IHJldHVybnMgdGhlIGNyaXRlcmlvbi5cbiAgXy5ncm91cEJ5ID0gZnVuY3Rpb24ob2JqLCB2YWx1ZSwgY29udGV4dCkge1xuICAgIHJldHVybiBncm91cChvYmosIHZhbHVlLCBjb250ZXh0LCBmdW5jdGlvbihyZXN1bHQsIGtleSwgdmFsdWUpIHtcbiAgICAgIChfLmhhcyhyZXN1bHQsIGtleSkgPyByZXN1bHRba2V5XSA6IChyZXN1bHRba2V5XSA9IFtdKSkucHVzaCh2YWx1ZSk7XG4gICAgfSk7XG4gIH07XG5cbiAgLy8gQ291bnRzIGluc3RhbmNlcyBvZiBhbiBvYmplY3QgdGhhdCBncm91cCBieSBhIGNlcnRhaW4gY3JpdGVyaW9uLiBQYXNzXG4gIC8vIGVpdGhlciBhIHN0cmluZyBhdHRyaWJ1dGUgdG8gY291bnQgYnksIG9yIGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIHRoZVxuICAvLyBjcml0ZXJpb24uXG4gIF8uY291bnRCeSA9IGZ1bmN0aW9uKG9iaiwgdmFsdWUsIGNvbnRleHQpIHtcbiAgICByZXR1cm4gZ3JvdXAob2JqLCB2YWx1ZSwgY29udGV4dCwgZnVuY3Rpb24ocmVzdWx0LCBrZXkpIHtcbiAgICAgIGlmICghXy5oYXMocmVzdWx0LCBrZXkpKSByZXN1bHRba2V5XSA9IDA7XG4gICAgICByZXN1bHRba2V5XSsrO1xuICAgIH0pO1xuICB9O1xuXG4gIC8vIFVzZSBhIGNvbXBhcmF0b3IgZnVuY3Rpb24gdG8gZmlndXJlIG91dCB0aGUgc21hbGxlc3QgaW5kZXggYXQgd2hpY2hcbiAgLy8gYW4gb2JqZWN0IHNob3VsZCBiZSBpbnNlcnRlZCBzbyBhcyB0byBtYWludGFpbiBvcmRlci4gVXNlcyBiaW5hcnkgc2VhcmNoLlxuICBfLnNvcnRlZEluZGV4ID0gZnVuY3Rpb24oYXJyYXksIG9iaiwgaXRlcmF0b3IsIGNvbnRleHQpIHtcbiAgICBpdGVyYXRvciA9IGl0ZXJhdG9yID09IG51bGwgPyBfLmlkZW50aXR5IDogbG9va3VwSXRlcmF0b3IoaXRlcmF0b3IpO1xuICAgIHZhciB2YWx1ZSA9IGl0ZXJhdG9yLmNhbGwoY29udGV4dCwgb2JqKTtcbiAgICB2YXIgbG93ID0gMCwgaGlnaCA9IGFycmF5Lmxlbmd0aDtcbiAgICB3aGlsZSAobG93IDwgaGlnaCkge1xuICAgICAgdmFyIG1pZCA9IChsb3cgKyBoaWdoKSA+Pj4gMTtcbiAgICAgIGl0ZXJhdG9yLmNhbGwoY29udGV4dCwgYXJyYXlbbWlkXSkgPCB2YWx1ZSA/IGxvdyA9IG1pZCArIDEgOiBoaWdoID0gbWlkO1xuICAgIH1cbiAgICByZXR1cm4gbG93O1xuICB9O1xuXG4gIC8vIFNhZmVseSBjb252ZXJ0IGFueXRoaW5nIGl0ZXJhYmxlIGludG8gYSByZWFsLCBsaXZlIGFycmF5LlxuICBfLnRvQXJyYXkgPSBmdW5jdGlvbihvYmopIHtcbiAgICBpZiAoIW9iaikgcmV0dXJuIFtdO1xuICAgIGlmIChfLmlzQXJyYXkob2JqKSkgcmV0dXJuIHNsaWNlLmNhbGwob2JqKTtcbiAgICBpZiAob2JqLmxlbmd0aCA9PT0gK29iai5sZW5ndGgpIHJldHVybiBfLm1hcChvYmosIF8uaWRlbnRpdHkpO1xuICAgIHJldHVybiBfLnZhbHVlcyhvYmopO1xuICB9O1xuXG4gIC8vIFJldHVybiB0aGUgbnVtYmVyIG9mIGVsZW1lbnRzIGluIGFuIG9iamVjdC5cbiAgXy5zaXplID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gMDtcbiAgICByZXR1cm4gKG9iai5sZW5ndGggPT09ICtvYmoubGVuZ3RoKSA/IG9iai5sZW5ndGggOiBfLmtleXMob2JqKS5sZW5ndGg7XG4gIH07XG5cbiAgLy8gQXJyYXkgRnVuY3Rpb25zXG4gIC8vIC0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIEdldCB0aGUgZmlyc3QgZWxlbWVudCBvZiBhbiBhcnJheS4gUGFzc2luZyAqKm4qKiB3aWxsIHJldHVybiB0aGUgZmlyc3QgTlxuICAvLyB2YWx1ZXMgaW4gdGhlIGFycmF5LiBBbGlhc2VkIGFzIGBoZWFkYCBhbmQgYHRha2VgLiBUaGUgKipndWFyZCoqIGNoZWNrXG4gIC8vIGFsbG93cyBpdCB0byB3b3JrIHdpdGggYF8ubWFwYC5cbiAgXy5maXJzdCA9IF8uaGVhZCA9IF8udGFrZSA9IGZ1bmN0aW9uKGFycmF5LCBuLCBndWFyZCkge1xuICAgIGlmIChhcnJheSA9PSBudWxsKSByZXR1cm4gdm9pZCAwO1xuICAgIHJldHVybiAobiAhPSBudWxsKSAmJiAhZ3VhcmQgPyBzbGljZS5jYWxsKGFycmF5LCAwLCBuKSA6IGFycmF5WzBdO1xuICB9O1xuXG4gIC8vIFJldHVybnMgZXZlcnl0aGluZyBidXQgdGhlIGxhc3QgZW50cnkgb2YgdGhlIGFycmF5LiBFc3BlY2lhbGx5IHVzZWZ1bCBvblxuICAvLyB0aGUgYXJndW1lbnRzIG9iamVjdC4gUGFzc2luZyAqKm4qKiB3aWxsIHJldHVybiBhbGwgdGhlIHZhbHVlcyBpblxuICAvLyB0aGUgYXJyYXksIGV4Y2x1ZGluZyB0aGUgbGFzdCBOLiBUaGUgKipndWFyZCoqIGNoZWNrIGFsbG93cyBpdCB0byB3b3JrIHdpdGhcbiAgLy8gYF8ubWFwYC5cbiAgXy5pbml0aWFsID0gZnVuY3Rpb24oYXJyYXksIG4sIGd1YXJkKSB7XG4gICAgcmV0dXJuIHNsaWNlLmNhbGwoYXJyYXksIDAsIGFycmF5Lmxlbmd0aCAtICgobiA9PSBudWxsKSB8fCBndWFyZCA/IDEgOiBuKSk7XG4gIH07XG5cbiAgLy8gR2V0IHRoZSBsYXN0IGVsZW1lbnQgb2YgYW4gYXJyYXkuIFBhc3NpbmcgKipuKiogd2lsbCByZXR1cm4gdGhlIGxhc3QgTlxuICAvLyB2YWx1ZXMgaW4gdGhlIGFycmF5LiBUaGUgKipndWFyZCoqIGNoZWNrIGFsbG93cyBpdCB0byB3b3JrIHdpdGggYF8ubWFwYC5cbiAgXy5sYXN0ID0gZnVuY3Rpb24oYXJyYXksIG4sIGd1YXJkKSB7XG4gICAgaWYgKGFycmF5ID09IG51bGwpIHJldHVybiB2b2lkIDA7XG4gICAgaWYgKChuICE9IG51bGwpICYmICFndWFyZCkge1xuICAgICAgcmV0dXJuIHNsaWNlLmNhbGwoYXJyYXksIE1hdGgubWF4KGFycmF5Lmxlbmd0aCAtIG4sIDApKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGFycmF5W2FycmF5Lmxlbmd0aCAtIDFdO1xuICAgIH1cbiAgfTtcblxuICAvLyBSZXR1cm5zIGV2ZXJ5dGhpbmcgYnV0IHRoZSBmaXJzdCBlbnRyeSBvZiB0aGUgYXJyYXkuIEFsaWFzZWQgYXMgYHRhaWxgIGFuZCBgZHJvcGAuXG4gIC8vIEVzcGVjaWFsbHkgdXNlZnVsIG9uIHRoZSBhcmd1bWVudHMgb2JqZWN0LiBQYXNzaW5nIGFuICoqbioqIHdpbGwgcmV0dXJuXG4gIC8vIHRoZSByZXN0IE4gdmFsdWVzIGluIHRoZSBhcnJheS4gVGhlICoqZ3VhcmQqKlxuICAvLyBjaGVjayBhbGxvd3MgaXQgdG8gd29yayB3aXRoIGBfLm1hcGAuXG4gIF8ucmVzdCA9IF8udGFpbCA9IF8uZHJvcCA9IGZ1bmN0aW9uKGFycmF5LCBuLCBndWFyZCkge1xuICAgIHJldHVybiBzbGljZS5jYWxsKGFycmF5LCAobiA9PSBudWxsKSB8fCBndWFyZCA/IDEgOiBuKTtcbiAgfTtcblxuICAvLyBUcmltIG91dCBhbGwgZmFsc3kgdmFsdWVzIGZyb20gYW4gYXJyYXkuXG4gIF8uY29tcGFjdCA9IGZ1bmN0aW9uKGFycmF5KSB7XG4gICAgcmV0dXJuIF8uZmlsdGVyKGFycmF5LCBfLmlkZW50aXR5KTtcbiAgfTtcblxuICAvLyBJbnRlcm5hbCBpbXBsZW1lbnRhdGlvbiBvZiBhIHJlY3Vyc2l2ZSBgZmxhdHRlbmAgZnVuY3Rpb24uXG4gIHZhciBmbGF0dGVuID0gZnVuY3Rpb24oaW5wdXQsIHNoYWxsb3csIG91dHB1dCkge1xuICAgIGVhY2goaW5wdXQsIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICBpZiAoXy5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgICBzaGFsbG93ID8gcHVzaC5hcHBseShvdXRwdXQsIHZhbHVlKSA6IGZsYXR0ZW4odmFsdWUsIHNoYWxsb3csIG91dHB1dCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvdXRwdXQucHVzaCh2YWx1ZSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIG91dHB1dDtcbiAgfTtcblxuICAvLyBSZXR1cm4gYSBjb21wbGV0ZWx5IGZsYXR0ZW5lZCB2ZXJzaW9uIG9mIGFuIGFycmF5LlxuICBfLmZsYXR0ZW4gPSBmdW5jdGlvbihhcnJheSwgc2hhbGxvdykge1xuICAgIHJldHVybiBmbGF0dGVuKGFycmF5LCBzaGFsbG93LCBbXSk7XG4gIH07XG5cbiAgLy8gUmV0dXJuIGEgdmVyc2lvbiBvZiB0aGUgYXJyYXkgdGhhdCBkb2VzIG5vdCBjb250YWluIHRoZSBzcGVjaWZpZWQgdmFsdWUocykuXG4gIF8ud2l0aG91dCA9IGZ1bmN0aW9uKGFycmF5KSB7XG4gICAgcmV0dXJuIF8uZGlmZmVyZW5jZShhcnJheSwgc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpKTtcbiAgfTtcblxuICAvLyBQcm9kdWNlIGEgZHVwbGljYXRlLWZyZWUgdmVyc2lvbiBvZiB0aGUgYXJyYXkuIElmIHRoZSBhcnJheSBoYXMgYWxyZWFkeVxuICAvLyBiZWVuIHNvcnRlZCwgeW91IGhhdmUgdGhlIG9wdGlvbiBvZiB1c2luZyBhIGZhc3RlciBhbGdvcml0aG0uXG4gIC8vIEFsaWFzZWQgYXMgYHVuaXF1ZWAuXG4gIF8udW5pcSA9IF8udW5pcXVlID0gZnVuY3Rpb24oYXJyYXksIGlzU29ydGVkLCBpdGVyYXRvciwgY29udGV4dCkge1xuICAgIGlmIChfLmlzRnVuY3Rpb24oaXNTb3J0ZWQpKSB7XG4gICAgICBjb250ZXh0ID0gaXRlcmF0b3I7XG4gICAgICBpdGVyYXRvciA9IGlzU29ydGVkO1xuICAgICAgaXNTb3J0ZWQgPSBmYWxzZTtcbiAgICB9XG4gICAgdmFyIGluaXRpYWwgPSBpdGVyYXRvciA/IF8ubWFwKGFycmF5LCBpdGVyYXRvciwgY29udGV4dCkgOiBhcnJheTtcbiAgICB2YXIgcmVzdWx0cyA9IFtdO1xuICAgIHZhciBzZWVuID0gW107XG4gICAgZWFjaChpbml0aWFsLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgpIHtcbiAgICAgIGlmIChpc1NvcnRlZCA/ICghaW5kZXggfHwgc2VlbltzZWVuLmxlbmd0aCAtIDFdICE9PSB2YWx1ZSkgOiAhXy5jb250YWlucyhzZWVuLCB2YWx1ZSkpIHtcbiAgICAgICAgc2Vlbi5wdXNoKHZhbHVlKTtcbiAgICAgICAgcmVzdWx0cy5wdXNoKGFycmF5W2luZGV4XSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH07XG5cbiAgLy8gUHJvZHVjZSBhbiBhcnJheSB0aGF0IGNvbnRhaW5zIHRoZSB1bmlvbjogZWFjaCBkaXN0aW5jdCBlbGVtZW50IGZyb20gYWxsIG9mXG4gIC8vIHRoZSBwYXNzZWQtaW4gYXJyYXlzLlxuICBfLnVuaW9uID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIF8udW5pcShjb25jYXQuYXBwbHkoQXJyYXlQcm90bywgYXJndW1lbnRzKSk7XG4gIH07XG5cbiAgLy8gUHJvZHVjZSBhbiBhcnJheSB0aGF0IGNvbnRhaW5zIGV2ZXJ5IGl0ZW0gc2hhcmVkIGJldHdlZW4gYWxsIHRoZVxuICAvLyBwYXNzZWQtaW4gYXJyYXlzLlxuICBfLmludGVyc2VjdGlvbiA9IGZ1bmN0aW9uKGFycmF5KSB7XG4gICAgdmFyIHJlc3QgPSBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgcmV0dXJuIF8uZmlsdGVyKF8udW5pcShhcnJheSksIGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgIHJldHVybiBfLmV2ZXJ5KHJlc3QsIGZ1bmN0aW9uKG90aGVyKSB7XG4gICAgICAgIHJldHVybiBfLmluZGV4T2Yob3RoZXIsIGl0ZW0pID49IDA7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfTtcblxuICAvLyBUYWtlIHRoZSBkaWZmZXJlbmNlIGJldHdlZW4gb25lIGFycmF5IGFuZCBhIG51bWJlciBvZiBvdGhlciBhcnJheXMuXG4gIC8vIE9ubHkgdGhlIGVsZW1lbnRzIHByZXNlbnQgaW4ganVzdCB0aGUgZmlyc3QgYXJyYXkgd2lsbCByZW1haW4uXG4gIF8uZGlmZmVyZW5jZSA9IGZ1bmN0aW9uKGFycmF5KSB7XG4gICAgdmFyIHJlc3QgPSBjb25jYXQuYXBwbHkoQXJyYXlQcm90bywgc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpKTtcbiAgICByZXR1cm4gXy5maWx0ZXIoYXJyYXksIGZ1bmN0aW9uKHZhbHVlKXsgcmV0dXJuICFfLmNvbnRhaW5zKHJlc3QsIHZhbHVlKTsgfSk7XG4gIH07XG5cbiAgLy8gWmlwIHRvZ2V0aGVyIG11bHRpcGxlIGxpc3RzIGludG8gYSBzaW5nbGUgYXJyYXkgLS0gZWxlbWVudHMgdGhhdCBzaGFyZVxuICAvLyBhbiBpbmRleCBnbyB0b2dldGhlci5cbiAgXy56aXAgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYXJncyA9IHNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbiAgICB2YXIgbGVuZ3RoID0gXy5tYXgoXy5wbHVjayhhcmdzLCAnbGVuZ3RoJykpO1xuICAgIHZhciByZXN1bHRzID0gbmV3IEFycmF5KGxlbmd0aCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgcmVzdWx0c1tpXSA9IF8ucGx1Y2soYXJncywgXCJcIiArIGkpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfTtcblxuICAvLyBDb252ZXJ0cyBsaXN0cyBpbnRvIG9iamVjdHMuIFBhc3MgZWl0aGVyIGEgc2luZ2xlIGFycmF5IG9mIGBba2V5LCB2YWx1ZV1gXG4gIC8vIHBhaXJzLCBvciB0d28gcGFyYWxsZWwgYXJyYXlzIG9mIHRoZSBzYW1lIGxlbmd0aCAtLSBvbmUgb2Yga2V5cywgYW5kIG9uZSBvZlxuICAvLyB0aGUgY29ycmVzcG9uZGluZyB2YWx1ZXMuXG4gIF8ub2JqZWN0ID0gZnVuY3Rpb24obGlzdCwgdmFsdWVzKSB7XG4gICAgaWYgKGxpc3QgPT0gbnVsbCkgcmV0dXJuIHt9O1xuICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IGxpc3QubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICBpZiAodmFsdWVzKSB7XG4gICAgICAgIHJlc3VsdFtsaXN0W2ldXSA9IHZhbHVlc1tpXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc3VsdFtsaXN0W2ldWzBdXSA9IGxpc3RbaV1bMV07XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgLy8gSWYgdGhlIGJyb3dzZXIgZG9lc24ndCBzdXBwbHkgdXMgd2l0aCBpbmRleE9mIChJJ20gbG9va2luZyBhdCB5b3UsICoqTVNJRSoqKSxcbiAgLy8gd2UgbmVlZCB0aGlzIGZ1bmN0aW9uLiBSZXR1cm4gdGhlIHBvc2l0aW9uIG9mIHRoZSBmaXJzdCBvY2N1cnJlbmNlIG9mIGFuXG4gIC8vIGl0ZW0gaW4gYW4gYXJyYXksIG9yIC0xIGlmIHRoZSBpdGVtIGlzIG5vdCBpbmNsdWRlZCBpbiB0aGUgYXJyYXkuXG4gIC8vIERlbGVnYXRlcyB0byAqKkVDTUFTY3JpcHQgNSoqJ3MgbmF0aXZlIGBpbmRleE9mYCBpZiBhdmFpbGFibGUuXG4gIC8vIElmIHRoZSBhcnJheSBpcyBsYXJnZSBhbmQgYWxyZWFkeSBpbiBzb3J0IG9yZGVyLCBwYXNzIGB0cnVlYFxuICAvLyBmb3IgKippc1NvcnRlZCoqIHRvIHVzZSBiaW5hcnkgc2VhcmNoLlxuICBfLmluZGV4T2YgPSBmdW5jdGlvbihhcnJheSwgaXRlbSwgaXNTb3J0ZWQpIHtcbiAgICBpZiAoYXJyYXkgPT0gbnVsbCkgcmV0dXJuIC0xO1xuICAgIHZhciBpID0gMCwgbCA9IGFycmF5Lmxlbmd0aDtcbiAgICBpZiAoaXNTb3J0ZWQpIHtcbiAgICAgIGlmICh0eXBlb2YgaXNTb3J0ZWQgPT0gJ251bWJlcicpIHtcbiAgICAgICAgaSA9IChpc1NvcnRlZCA8IDAgPyBNYXRoLm1heCgwLCBsICsgaXNTb3J0ZWQpIDogaXNTb3J0ZWQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaSA9IF8uc29ydGVkSW5kZXgoYXJyYXksIGl0ZW0pO1xuICAgICAgICByZXR1cm4gYXJyYXlbaV0gPT09IGl0ZW0gPyBpIDogLTE7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChuYXRpdmVJbmRleE9mICYmIGFycmF5LmluZGV4T2YgPT09IG5hdGl2ZUluZGV4T2YpIHJldHVybiBhcnJheS5pbmRleE9mKGl0ZW0sIGlzU29ydGVkKTtcbiAgICBmb3IgKDsgaSA8IGw7IGkrKykgaWYgKGFycmF5W2ldID09PSBpdGVtKSByZXR1cm4gaTtcbiAgICByZXR1cm4gLTE7XG4gIH07XG5cbiAgLy8gRGVsZWdhdGVzIHRvICoqRUNNQVNjcmlwdCA1KioncyBuYXRpdmUgYGxhc3RJbmRleE9mYCBpZiBhdmFpbGFibGUuXG4gIF8ubGFzdEluZGV4T2YgPSBmdW5jdGlvbihhcnJheSwgaXRlbSwgZnJvbSkge1xuICAgIGlmIChhcnJheSA9PSBudWxsKSByZXR1cm4gLTE7XG4gICAgdmFyIGhhc0luZGV4ID0gZnJvbSAhPSBudWxsO1xuICAgIGlmIChuYXRpdmVMYXN0SW5kZXhPZiAmJiBhcnJheS5sYXN0SW5kZXhPZiA9PT0gbmF0aXZlTGFzdEluZGV4T2YpIHtcbiAgICAgIHJldHVybiBoYXNJbmRleCA/IGFycmF5Lmxhc3RJbmRleE9mKGl0ZW0sIGZyb20pIDogYXJyYXkubGFzdEluZGV4T2YoaXRlbSk7XG4gICAgfVxuICAgIHZhciBpID0gKGhhc0luZGV4ID8gZnJvbSA6IGFycmF5Lmxlbmd0aCk7XG4gICAgd2hpbGUgKGktLSkgaWYgKGFycmF5W2ldID09PSBpdGVtKSByZXR1cm4gaTtcbiAgICByZXR1cm4gLTE7XG4gIH07XG5cbiAgLy8gR2VuZXJhdGUgYW4gaW50ZWdlciBBcnJheSBjb250YWluaW5nIGFuIGFyaXRobWV0aWMgcHJvZ3Jlc3Npb24uIEEgcG9ydCBvZlxuICAvLyB0aGUgbmF0aXZlIFB5dGhvbiBgcmFuZ2UoKWAgZnVuY3Rpb24uIFNlZVxuICAvLyBbdGhlIFB5dGhvbiBkb2N1bWVudGF0aW9uXShodHRwOi8vZG9jcy5weXRob24ub3JnL2xpYnJhcnkvZnVuY3Rpb25zLmh0bWwjcmFuZ2UpLlxuICBfLnJhbmdlID0gZnVuY3Rpb24oc3RhcnQsIHN0b3AsIHN0ZXApIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8PSAxKSB7XG4gICAgICBzdG9wID0gc3RhcnQgfHwgMDtcbiAgICAgIHN0YXJ0ID0gMDtcbiAgICB9XG4gICAgc3RlcCA9IGFyZ3VtZW50c1syXSB8fCAxO1xuXG4gICAgdmFyIGxlbiA9IE1hdGgubWF4KE1hdGguY2VpbCgoc3RvcCAtIHN0YXJ0KSAvIHN0ZXApLCAwKTtcbiAgICB2YXIgaWR4ID0gMDtcbiAgICB2YXIgcmFuZ2UgPSBuZXcgQXJyYXkobGVuKTtcblxuICAgIHdoaWxlKGlkeCA8IGxlbikge1xuICAgICAgcmFuZ2VbaWR4KytdID0gc3RhcnQ7XG4gICAgICBzdGFydCArPSBzdGVwO1xuICAgIH1cblxuICAgIHJldHVybiByYW5nZTtcbiAgfTtcblxuICAvLyBGdW5jdGlvbiAoYWhlbSkgRnVuY3Rpb25zXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIENyZWF0ZSBhIGZ1bmN0aW9uIGJvdW5kIHRvIGEgZ2l2ZW4gb2JqZWN0IChhc3NpZ25pbmcgYHRoaXNgLCBhbmQgYXJndW1lbnRzLFxuICAvLyBvcHRpb25hbGx5KS4gRGVsZWdhdGVzIHRvICoqRUNNQVNjcmlwdCA1KioncyBuYXRpdmUgYEZ1bmN0aW9uLmJpbmRgIGlmXG4gIC8vIGF2YWlsYWJsZS5cbiAgXy5iaW5kID0gZnVuY3Rpb24oZnVuYywgY29udGV4dCkge1xuICAgIGlmIChmdW5jLmJpbmQgPT09IG5hdGl2ZUJpbmQgJiYgbmF0aXZlQmluZCkgcmV0dXJuIG5hdGl2ZUJpbmQuYXBwbHkoZnVuYywgc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpKTtcbiAgICB2YXIgYXJncyA9IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAyKTtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gZnVuYy5hcHBseShjb250ZXh0LCBhcmdzLmNvbmNhdChzbGljZS5jYWxsKGFyZ3VtZW50cykpKTtcbiAgICB9O1xuICB9O1xuXG4gIC8vIFBhcnRpYWxseSBhcHBseSBhIGZ1bmN0aW9uIGJ5IGNyZWF0aW5nIGEgdmVyc2lvbiB0aGF0IGhhcyBoYWQgc29tZSBvZiBpdHNcbiAgLy8gYXJndW1lbnRzIHByZS1maWxsZWQsIHdpdGhvdXQgY2hhbmdpbmcgaXRzIGR5bmFtaWMgYHRoaXNgIGNvbnRleHQuXG4gIF8ucGFydGlhbCA9IGZ1bmN0aW9uKGZ1bmMpIHtcbiAgICB2YXIgYXJncyA9IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gZnVuYy5hcHBseSh0aGlzLCBhcmdzLmNvbmNhdChzbGljZS5jYWxsKGFyZ3VtZW50cykpKTtcbiAgICB9O1xuICB9O1xuXG4gIC8vIEJpbmQgYWxsIG9mIGFuIG9iamVjdCdzIG1ldGhvZHMgdG8gdGhhdCBvYmplY3QuIFVzZWZ1bCBmb3IgZW5zdXJpbmcgdGhhdFxuICAvLyBhbGwgY2FsbGJhY2tzIGRlZmluZWQgb24gYW4gb2JqZWN0IGJlbG9uZyB0byBpdC5cbiAgXy5iaW5kQWxsID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIGZ1bmNzID0gc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgIGlmIChmdW5jcy5sZW5ndGggPT09IDApIGZ1bmNzID0gXy5mdW5jdGlvbnMob2JqKTtcbiAgICBlYWNoKGZ1bmNzLCBmdW5jdGlvbihmKSB7IG9ialtmXSA9IF8uYmluZChvYmpbZl0sIG9iaik7IH0pO1xuICAgIHJldHVybiBvYmo7XG4gIH07XG5cbiAgLy8gTWVtb2l6ZSBhbiBleHBlbnNpdmUgZnVuY3Rpb24gYnkgc3RvcmluZyBpdHMgcmVzdWx0cy5cbiAgXy5tZW1vaXplID0gZnVuY3Rpb24oZnVuYywgaGFzaGVyKSB7XG4gICAgdmFyIG1lbW8gPSB7fTtcbiAgICBoYXNoZXIgfHwgKGhhc2hlciA9IF8uaWRlbnRpdHkpO1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBrZXkgPSBoYXNoZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIHJldHVybiBfLmhhcyhtZW1vLCBrZXkpID8gbWVtb1trZXldIDogKG1lbW9ba2V5XSA9IGZ1bmMuYXBwbHkodGhpcywgYXJndW1lbnRzKSk7XG4gICAgfTtcbiAgfTtcblxuICAvLyBEZWxheXMgYSBmdW5jdGlvbiBmb3IgdGhlIGdpdmVuIG51bWJlciBvZiBtaWxsaXNlY29uZHMsIGFuZCB0aGVuIGNhbGxzXG4gIC8vIGl0IHdpdGggdGhlIGFyZ3VtZW50cyBzdXBwbGllZC5cbiAgXy5kZWxheSA9IGZ1bmN0aW9uKGZ1bmMsIHdhaXQpIHtcbiAgICB2YXIgYXJncyA9IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAyKTtcbiAgICByZXR1cm4gc2V0VGltZW91dChmdW5jdGlvbigpeyByZXR1cm4gZnVuYy5hcHBseShudWxsLCBhcmdzKTsgfSwgd2FpdCk7XG4gIH07XG5cbiAgLy8gRGVmZXJzIGEgZnVuY3Rpb24sIHNjaGVkdWxpbmcgaXQgdG8gcnVuIGFmdGVyIHRoZSBjdXJyZW50IGNhbGwgc3RhY2sgaGFzXG4gIC8vIGNsZWFyZWQuXG4gIF8uZGVmZXIgPSBmdW5jdGlvbihmdW5jKSB7XG4gICAgcmV0dXJuIF8uZGVsYXkuYXBwbHkoXywgW2Z1bmMsIDFdLmNvbmNhdChzbGljZS5jYWxsKGFyZ3VtZW50cywgMSkpKTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGEgZnVuY3Rpb24sIHRoYXQsIHdoZW4gaW52b2tlZCwgd2lsbCBvbmx5IGJlIHRyaWdnZXJlZCBhdCBtb3N0IG9uY2VcbiAgLy8gZHVyaW5nIGEgZ2l2ZW4gd2luZG93IG9mIHRpbWUuXG4gIF8udGhyb3R0bGUgPSBmdW5jdGlvbihmdW5jLCB3YWl0KSB7XG4gICAgdmFyIGNvbnRleHQsIGFyZ3MsIHRpbWVvdXQsIHJlc3VsdDtcbiAgICB2YXIgcHJldmlvdXMgPSAwO1xuICAgIHZhciBsYXRlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgcHJldmlvdXMgPSBuZXcgRGF0ZTtcbiAgICAgIHRpbWVvdXQgPSBudWxsO1xuICAgICAgcmVzdWx0ID0gZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICB9O1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBub3cgPSBuZXcgRGF0ZTtcbiAgICAgIHZhciByZW1haW5pbmcgPSB3YWl0IC0gKG5vdyAtIHByZXZpb3VzKTtcbiAgICAgIGNvbnRleHQgPSB0aGlzO1xuICAgICAgYXJncyA9IGFyZ3VtZW50cztcbiAgICAgIGlmIChyZW1haW5pbmcgPD0gMCkge1xuICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgICAgIHRpbWVvdXQgPSBudWxsO1xuICAgICAgICBwcmV2aW91cyA9IG5vdztcbiAgICAgICAgcmVzdWx0ID0gZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICAgIH0gZWxzZSBpZiAoIXRpbWVvdXQpIHtcbiAgICAgICAgdGltZW91dCA9IHNldFRpbWVvdXQobGF0ZXIsIHJlbWFpbmluZyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG4gIH07XG5cbiAgLy8gUmV0dXJucyBhIGZ1bmN0aW9uLCB0aGF0LCBhcyBsb25nIGFzIGl0IGNvbnRpbnVlcyB0byBiZSBpbnZva2VkLCB3aWxsIG5vdFxuICAvLyBiZSB0cmlnZ2VyZWQuIFRoZSBmdW5jdGlvbiB3aWxsIGJlIGNhbGxlZCBhZnRlciBpdCBzdG9wcyBiZWluZyBjYWxsZWQgZm9yXG4gIC8vIE4gbWlsbGlzZWNvbmRzLiBJZiBgaW1tZWRpYXRlYCBpcyBwYXNzZWQsIHRyaWdnZXIgdGhlIGZ1bmN0aW9uIG9uIHRoZVxuICAvLyBsZWFkaW5nIGVkZ2UsIGluc3RlYWQgb2YgdGhlIHRyYWlsaW5nLlxuICBfLmRlYm91bmNlID0gZnVuY3Rpb24oZnVuYywgd2FpdCwgaW1tZWRpYXRlKSB7XG4gICAgdmFyIHRpbWVvdXQsIHJlc3VsdDtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgY29udGV4dCA9IHRoaXMsIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICB2YXIgbGF0ZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdGltZW91dCA9IG51bGw7XG4gICAgICAgIGlmICghaW1tZWRpYXRlKSByZXN1bHQgPSBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgfTtcbiAgICAgIHZhciBjYWxsTm93ID0gaW1tZWRpYXRlICYmICF0aW1lb3V0O1xuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgICAgdGltZW91dCA9IHNldFRpbWVvdXQobGF0ZXIsIHdhaXQpO1xuICAgICAgaWYgKGNhbGxOb3cpIHJlc3VsdCA9IGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG4gIH07XG5cbiAgLy8gUmV0dXJucyBhIGZ1bmN0aW9uIHRoYXQgd2lsbCBiZSBleGVjdXRlZCBhdCBtb3N0IG9uZSB0aW1lLCBubyBtYXR0ZXIgaG93XG4gIC8vIG9mdGVuIHlvdSBjYWxsIGl0LiBVc2VmdWwgZm9yIGxhenkgaW5pdGlhbGl6YXRpb24uXG4gIF8ub25jZSA9IGZ1bmN0aW9uKGZ1bmMpIHtcbiAgICB2YXIgcmFuID0gZmFsc2UsIG1lbW87XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHJhbikgcmV0dXJuIG1lbW87XG4gICAgICByYW4gPSB0cnVlO1xuICAgICAgbWVtbyA9IGZ1bmMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIGZ1bmMgPSBudWxsO1xuICAgICAgcmV0dXJuIG1lbW87XG4gICAgfTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIHRoZSBmaXJzdCBmdW5jdGlvbiBwYXNzZWQgYXMgYW4gYXJndW1lbnQgdG8gdGhlIHNlY29uZCxcbiAgLy8gYWxsb3dpbmcgeW91IHRvIGFkanVzdCBhcmd1bWVudHMsIHJ1biBjb2RlIGJlZm9yZSBhbmQgYWZ0ZXIsIGFuZFxuICAvLyBjb25kaXRpb25hbGx5IGV4ZWN1dGUgdGhlIG9yaWdpbmFsIGZ1bmN0aW9uLlxuICBfLndyYXAgPSBmdW5jdGlvbihmdW5jLCB3cmFwcGVyKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGFyZ3MgPSBbZnVuY107XG4gICAgICBwdXNoLmFwcGx5KGFyZ3MsIGFyZ3VtZW50cyk7XG4gICAgICByZXR1cm4gd3JhcHBlci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB9O1xuICB9O1xuXG4gIC8vIFJldHVybnMgYSBmdW5jdGlvbiB0aGF0IGlzIHRoZSBjb21wb3NpdGlvbiBvZiBhIGxpc3Qgb2YgZnVuY3Rpb25zLCBlYWNoXG4gIC8vIGNvbnN1bWluZyB0aGUgcmV0dXJuIHZhbHVlIG9mIHRoZSBmdW5jdGlvbiB0aGF0IGZvbGxvd3MuXG4gIF8uY29tcG9zZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBmdW5jcyA9IGFyZ3VtZW50cztcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgYXJncyA9IGFyZ3VtZW50cztcbiAgICAgIGZvciAodmFyIGkgPSBmdW5jcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICBhcmdzID0gW2Z1bmNzW2ldLmFwcGx5KHRoaXMsIGFyZ3MpXTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBhcmdzWzBdO1xuICAgIH07XG4gIH07XG5cbiAgLy8gUmV0dXJucyBhIGZ1bmN0aW9uIHRoYXQgd2lsbCBvbmx5IGJlIGV4ZWN1dGVkIGFmdGVyIGJlaW5nIGNhbGxlZCBOIHRpbWVzLlxuICBfLmFmdGVyID0gZnVuY3Rpb24odGltZXMsIGZ1bmMpIHtcbiAgICBpZiAodGltZXMgPD0gMCkgcmV0dXJuIGZ1bmMoKTtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoLS10aW1lcyA8IDEpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIH1cbiAgICB9O1xuICB9O1xuXG4gIC8vIE9iamVjdCBGdW5jdGlvbnNcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIFJldHJpZXZlIHRoZSBuYW1lcyBvZiBhbiBvYmplY3QncyBwcm9wZXJ0aWVzLlxuICAvLyBEZWxlZ2F0ZXMgdG8gKipFQ01BU2NyaXB0IDUqKidzIG5hdGl2ZSBgT2JqZWN0LmtleXNgXG4gIF8ua2V5cyA9IG5hdGl2ZUtleXMgfHwgZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKG9iaiAhPT0gT2JqZWN0KG9iaikpIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgb2JqZWN0Jyk7XG4gICAgdmFyIGtleXMgPSBbXTtcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSBpZiAoXy5oYXMob2JqLCBrZXkpKSBrZXlzW2tleXMubGVuZ3RoXSA9IGtleTtcbiAgICByZXR1cm4ga2V5cztcbiAgfTtcblxuICAvLyBSZXRyaWV2ZSB0aGUgdmFsdWVzIG9mIGFuIG9iamVjdCdzIHByb3BlcnRpZXMuXG4gIF8udmFsdWVzID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIHZhbHVlcyA9IFtdO1xuICAgIGZvciAodmFyIGtleSBpbiBvYmopIGlmIChfLmhhcyhvYmosIGtleSkpIHZhbHVlcy5wdXNoKG9ialtrZXldKTtcbiAgICByZXR1cm4gdmFsdWVzO1xuICB9O1xuXG4gIC8vIENvbnZlcnQgYW4gb2JqZWN0IGludG8gYSBsaXN0IG9mIGBba2V5LCB2YWx1ZV1gIHBhaXJzLlxuICBfLnBhaXJzID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIHBhaXJzID0gW107XG4gICAgZm9yICh2YXIga2V5IGluIG9iaikgaWYgKF8uaGFzKG9iaiwga2V5KSkgcGFpcnMucHVzaChba2V5LCBvYmpba2V5XV0pO1xuICAgIHJldHVybiBwYWlycztcbiAgfTtcblxuICAvLyBJbnZlcnQgdGhlIGtleXMgYW5kIHZhbHVlcyBvZiBhbiBvYmplY3QuIFRoZSB2YWx1ZXMgbXVzdCBiZSBzZXJpYWxpemFibGUuXG4gIF8uaW52ZXJ0ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgIGZvciAodmFyIGtleSBpbiBvYmopIGlmIChfLmhhcyhvYmosIGtleSkpIHJlc3VsdFtvYmpba2V5XV0gPSBrZXk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBSZXR1cm4gYSBzb3J0ZWQgbGlzdCBvZiB0aGUgZnVuY3Rpb24gbmFtZXMgYXZhaWxhYmxlIG9uIHRoZSBvYmplY3QuXG4gIC8vIEFsaWFzZWQgYXMgYG1ldGhvZHNgXG4gIF8uZnVuY3Rpb25zID0gXy5tZXRob2RzID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIG5hbWVzID0gW107XG4gICAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgICAgaWYgKF8uaXNGdW5jdGlvbihvYmpba2V5XSkpIG5hbWVzLnB1c2goa2V5KTtcbiAgICB9XG4gICAgcmV0dXJuIG5hbWVzLnNvcnQoKTtcbiAgfTtcblxuICAvLyBFeHRlbmQgYSBnaXZlbiBvYmplY3Qgd2l0aCBhbGwgdGhlIHByb3BlcnRpZXMgaW4gcGFzc2VkLWluIG9iamVjdChzKS5cbiAgXy5leHRlbmQgPSBmdW5jdGlvbihvYmopIHtcbiAgICBlYWNoKHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSwgZnVuY3Rpb24oc291cmNlKSB7XG4gICAgICBpZiAoc291cmNlKSB7XG4gICAgICAgIGZvciAodmFyIHByb3AgaW4gc291cmNlKSB7XG4gICAgICAgICAgb2JqW3Byb3BdID0gc291cmNlW3Byb3BdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIG9iajtcbiAgfTtcblxuICAvLyBSZXR1cm4gYSBjb3B5IG9mIHRoZSBvYmplY3Qgb25seSBjb250YWluaW5nIHRoZSB3aGl0ZWxpc3RlZCBwcm9wZXJ0aWVzLlxuICBfLnBpY2sgPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIgY29weSA9IHt9O1xuICAgIHZhciBrZXlzID0gY29uY2F0LmFwcGx5KEFycmF5UHJvdG8sIHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSk7XG4gICAgZWFjaChrZXlzLCBmdW5jdGlvbihrZXkpIHtcbiAgICAgIGlmIChrZXkgaW4gb2JqKSBjb3B5W2tleV0gPSBvYmpba2V5XTtcbiAgICB9KTtcbiAgICByZXR1cm4gY29weTtcbiAgfTtcblxuICAgLy8gUmV0dXJuIGEgY29weSBvZiB0aGUgb2JqZWN0IHdpdGhvdXQgdGhlIGJsYWNrbGlzdGVkIHByb3BlcnRpZXMuXG4gIF8ub21pdCA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciBjb3B5ID0ge307XG4gICAgdmFyIGtleXMgPSBjb25jYXQuYXBwbHkoQXJyYXlQcm90bywgc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpKTtcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgICBpZiAoIV8uY29udGFpbnMoa2V5cywga2V5KSkgY29weVtrZXldID0gb2JqW2tleV07XG4gICAgfVxuICAgIHJldHVybiBjb3B5O1xuICB9O1xuXG4gIC8vIEZpbGwgaW4gYSBnaXZlbiBvYmplY3Qgd2l0aCBkZWZhdWx0IHByb3BlcnRpZXMuXG4gIF8uZGVmYXVsdHMgPSBmdW5jdGlvbihvYmopIHtcbiAgICBlYWNoKHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSwgZnVuY3Rpb24oc291cmNlKSB7XG4gICAgICBpZiAoc291cmNlKSB7XG4gICAgICAgIGZvciAodmFyIHByb3AgaW4gc291cmNlKSB7XG4gICAgICAgICAgaWYgKG9ialtwcm9wXSA9PSBudWxsKSBvYmpbcHJvcF0gPSBzb3VyY2VbcHJvcF07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gb2JqO1xuICB9O1xuXG4gIC8vIENyZWF0ZSBhIChzaGFsbG93LWNsb25lZCkgZHVwbGljYXRlIG9mIGFuIG9iamVjdC5cbiAgXy5jbG9uZSA9IGZ1bmN0aW9uKG9iaikge1xuICAgIGlmICghXy5pc09iamVjdChvYmopKSByZXR1cm4gb2JqO1xuICAgIHJldHVybiBfLmlzQXJyYXkob2JqKSA/IG9iai5zbGljZSgpIDogXy5leHRlbmQoe30sIG9iaik7XG4gIH07XG5cbiAgLy8gSW52b2tlcyBpbnRlcmNlcHRvciB3aXRoIHRoZSBvYmosIGFuZCB0aGVuIHJldHVybnMgb2JqLlxuICAvLyBUaGUgcHJpbWFyeSBwdXJwb3NlIG9mIHRoaXMgbWV0aG9kIGlzIHRvIFwidGFwIGludG9cIiBhIG1ldGhvZCBjaGFpbiwgaW5cbiAgLy8gb3JkZXIgdG8gcGVyZm9ybSBvcGVyYXRpb25zIG9uIGludGVybWVkaWF0ZSByZXN1bHRzIHdpdGhpbiB0aGUgY2hhaW4uXG4gIF8udGFwID0gZnVuY3Rpb24ob2JqLCBpbnRlcmNlcHRvcikge1xuICAgIGludGVyY2VwdG9yKG9iaik7XG4gICAgcmV0dXJuIG9iajtcbiAgfTtcblxuICAvLyBJbnRlcm5hbCByZWN1cnNpdmUgY29tcGFyaXNvbiBmdW5jdGlvbiBmb3IgYGlzRXF1YWxgLlxuICB2YXIgZXEgPSBmdW5jdGlvbihhLCBiLCBhU3RhY2ssIGJTdGFjaykge1xuICAgIC8vIElkZW50aWNhbCBvYmplY3RzIGFyZSBlcXVhbC4gYDAgPT09IC0wYCwgYnV0IHRoZXkgYXJlbid0IGlkZW50aWNhbC5cbiAgICAvLyBTZWUgdGhlIEhhcm1vbnkgYGVnYWxgIHByb3Bvc2FsOiBodHRwOi8vd2lraS5lY21hc2NyaXB0Lm9yZy9kb2t1LnBocD9pZD1oYXJtb255OmVnYWwuXG4gICAgaWYgKGEgPT09IGIpIHJldHVybiBhICE9PSAwIHx8IDEgLyBhID09IDEgLyBiO1xuICAgIC8vIEEgc3RyaWN0IGNvbXBhcmlzb24gaXMgbmVjZXNzYXJ5IGJlY2F1c2UgYG51bGwgPT0gdW5kZWZpbmVkYC5cbiAgICBpZiAoYSA9PSBudWxsIHx8IGIgPT0gbnVsbCkgcmV0dXJuIGEgPT09IGI7XG4gICAgLy8gVW53cmFwIGFueSB3cmFwcGVkIG9iamVjdHMuXG4gICAgaWYgKGEgaW5zdGFuY2VvZiBfKSBhID0gYS5fd3JhcHBlZDtcbiAgICBpZiAoYiBpbnN0YW5jZW9mIF8pIGIgPSBiLl93cmFwcGVkO1xuICAgIC8vIENvbXBhcmUgYFtbQ2xhc3NdXWAgbmFtZXMuXG4gICAgdmFyIGNsYXNzTmFtZSA9IHRvU3RyaW5nLmNhbGwoYSk7XG4gICAgaWYgKGNsYXNzTmFtZSAhPSB0b1N0cmluZy5jYWxsKGIpKSByZXR1cm4gZmFsc2U7XG4gICAgc3dpdGNoIChjbGFzc05hbWUpIHtcbiAgICAgIC8vIFN0cmluZ3MsIG51bWJlcnMsIGRhdGVzLCBhbmQgYm9vbGVhbnMgYXJlIGNvbXBhcmVkIGJ5IHZhbHVlLlxuICAgICAgY2FzZSAnW29iamVjdCBTdHJpbmddJzpcbiAgICAgICAgLy8gUHJpbWl0aXZlcyBhbmQgdGhlaXIgY29ycmVzcG9uZGluZyBvYmplY3Qgd3JhcHBlcnMgYXJlIGVxdWl2YWxlbnQ7IHRodXMsIGBcIjVcImAgaXNcbiAgICAgICAgLy8gZXF1aXZhbGVudCB0byBgbmV3IFN0cmluZyhcIjVcIilgLlxuICAgICAgICByZXR1cm4gYSA9PSBTdHJpbmcoYik7XG4gICAgICBjYXNlICdbb2JqZWN0IE51bWJlcl0nOlxuICAgICAgICAvLyBgTmFOYHMgYXJlIGVxdWl2YWxlbnQsIGJ1dCBub24tcmVmbGV4aXZlLiBBbiBgZWdhbGAgY29tcGFyaXNvbiBpcyBwZXJmb3JtZWQgZm9yXG4gICAgICAgIC8vIG90aGVyIG51bWVyaWMgdmFsdWVzLlxuICAgICAgICByZXR1cm4gYSAhPSArYSA/IGIgIT0gK2IgOiAoYSA9PSAwID8gMSAvIGEgPT0gMSAvIGIgOiBhID09ICtiKTtcbiAgICAgIGNhc2UgJ1tvYmplY3QgRGF0ZV0nOlxuICAgICAgY2FzZSAnW29iamVjdCBCb29sZWFuXSc6XG4gICAgICAgIC8vIENvZXJjZSBkYXRlcyBhbmQgYm9vbGVhbnMgdG8gbnVtZXJpYyBwcmltaXRpdmUgdmFsdWVzLiBEYXRlcyBhcmUgY29tcGFyZWQgYnkgdGhlaXJcbiAgICAgICAgLy8gbWlsbGlzZWNvbmQgcmVwcmVzZW50YXRpb25zLiBOb3RlIHRoYXQgaW52YWxpZCBkYXRlcyB3aXRoIG1pbGxpc2Vjb25kIHJlcHJlc2VudGF0aW9uc1xuICAgICAgICAvLyBvZiBgTmFOYCBhcmUgbm90IGVxdWl2YWxlbnQuXG4gICAgICAgIHJldHVybiArYSA9PSArYjtcbiAgICAgIC8vIFJlZ0V4cHMgYXJlIGNvbXBhcmVkIGJ5IHRoZWlyIHNvdXJjZSBwYXR0ZXJucyBhbmQgZmxhZ3MuXG4gICAgICBjYXNlICdbb2JqZWN0IFJlZ0V4cF0nOlxuICAgICAgICByZXR1cm4gYS5zb3VyY2UgPT0gYi5zb3VyY2UgJiZcbiAgICAgICAgICAgICAgIGEuZ2xvYmFsID09IGIuZ2xvYmFsICYmXG4gICAgICAgICAgICAgICBhLm11bHRpbGluZSA9PSBiLm11bHRpbGluZSAmJlxuICAgICAgICAgICAgICAgYS5pZ25vcmVDYXNlID09IGIuaWdub3JlQ2FzZTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBhICE9ICdvYmplY3QnIHx8IHR5cGVvZiBiICE9ICdvYmplY3QnKSByZXR1cm4gZmFsc2U7XG4gICAgLy8gQXNzdW1lIGVxdWFsaXR5IGZvciBjeWNsaWMgc3RydWN0dXJlcy4gVGhlIGFsZ29yaXRobSBmb3IgZGV0ZWN0aW5nIGN5Y2xpY1xuICAgIC8vIHN0cnVjdHVyZXMgaXMgYWRhcHRlZCBmcm9tIEVTIDUuMSBzZWN0aW9uIDE1LjEyLjMsIGFic3RyYWN0IG9wZXJhdGlvbiBgSk9gLlxuICAgIHZhciBsZW5ndGggPSBhU3RhY2subGVuZ3RoO1xuICAgIHdoaWxlIChsZW5ndGgtLSkge1xuICAgICAgLy8gTGluZWFyIHNlYXJjaC4gUGVyZm9ybWFuY2UgaXMgaW52ZXJzZWx5IHByb3BvcnRpb25hbCB0byB0aGUgbnVtYmVyIG9mXG4gICAgICAvLyB1bmlxdWUgbmVzdGVkIHN0cnVjdHVyZXMuXG4gICAgICBpZiAoYVN0YWNrW2xlbmd0aF0gPT0gYSkgcmV0dXJuIGJTdGFja1tsZW5ndGhdID09IGI7XG4gICAgfVxuICAgIC8vIEFkZCB0aGUgZmlyc3Qgb2JqZWN0IHRvIHRoZSBzdGFjayBvZiB0cmF2ZXJzZWQgb2JqZWN0cy5cbiAgICBhU3RhY2sucHVzaChhKTtcbiAgICBiU3RhY2sucHVzaChiKTtcbiAgICB2YXIgc2l6ZSA9IDAsIHJlc3VsdCA9IHRydWU7XG4gICAgLy8gUmVjdXJzaXZlbHkgY29tcGFyZSBvYmplY3RzIGFuZCBhcnJheXMuXG4gICAgaWYgKGNsYXNzTmFtZSA9PSAnW29iamVjdCBBcnJheV0nKSB7XG4gICAgICAvLyBDb21wYXJlIGFycmF5IGxlbmd0aHMgdG8gZGV0ZXJtaW5lIGlmIGEgZGVlcCBjb21wYXJpc29uIGlzIG5lY2Vzc2FyeS5cbiAgICAgIHNpemUgPSBhLmxlbmd0aDtcbiAgICAgIHJlc3VsdCA9IHNpemUgPT0gYi5sZW5ndGg7XG4gICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgIC8vIERlZXAgY29tcGFyZSB0aGUgY29udGVudHMsIGlnbm9yaW5nIG5vbi1udW1lcmljIHByb3BlcnRpZXMuXG4gICAgICAgIHdoaWxlIChzaXplLS0pIHtcbiAgICAgICAgICBpZiAoIShyZXN1bHQgPSBlcShhW3NpemVdLCBiW3NpemVdLCBhU3RhY2ssIGJTdGFjaykpKSBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBPYmplY3RzIHdpdGggZGlmZmVyZW50IGNvbnN0cnVjdG9ycyBhcmUgbm90IGVxdWl2YWxlbnQsIGJ1dCBgT2JqZWN0YHNcbiAgICAgIC8vIGZyb20gZGlmZmVyZW50IGZyYW1lcyBhcmUuXG4gICAgICB2YXIgYUN0b3IgPSBhLmNvbnN0cnVjdG9yLCBiQ3RvciA9IGIuY29uc3RydWN0b3I7XG4gICAgICBpZiAoYUN0b3IgIT09IGJDdG9yICYmICEoXy5pc0Z1bmN0aW9uKGFDdG9yKSAmJiAoYUN0b3IgaW5zdGFuY2VvZiBhQ3RvcikgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLmlzRnVuY3Rpb24oYkN0b3IpICYmIChiQ3RvciBpbnN0YW5jZW9mIGJDdG9yKSkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgLy8gRGVlcCBjb21wYXJlIG9iamVjdHMuXG4gICAgICBmb3IgKHZhciBrZXkgaW4gYSkge1xuICAgICAgICBpZiAoXy5oYXMoYSwga2V5KSkge1xuICAgICAgICAgIC8vIENvdW50IHRoZSBleHBlY3RlZCBudW1iZXIgb2YgcHJvcGVydGllcy5cbiAgICAgICAgICBzaXplKys7XG4gICAgICAgICAgLy8gRGVlcCBjb21wYXJlIGVhY2ggbWVtYmVyLlxuICAgICAgICAgIGlmICghKHJlc3VsdCA9IF8uaGFzKGIsIGtleSkgJiYgZXEoYVtrZXldLCBiW2tleV0sIGFTdGFjaywgYlN0YWNrKSkpIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyBFbnN1cmUgdGhhdCBib3RoIG9iamVjdHMgY29udGFpbiB0aGUgc2FtZSBudW1iZXIgb2YgcHJvcGVydGllcy5cbiAgICAgIGlmIChyZXN1bHQpIHtcbiAgICAgICAgZm9yIChrZXkgaW4gYikge1xuICAgICAgICAgIGlmIChfLmhhcyhiLCBrZXkpICYmICEoc2l6ZS0tKSkgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0ID0gIXNpemU7XG4gICAgICB9XG4gICAgfVxuICAgIC8vIFJlbW92ZSB0aGUgZmlyc3Qgb2JqZWN0IGZyb20gdGhlIHN0YWNrIG9mIHRyYXZlcnNlZCBvYmplY3RzLlxuICAgIGFTdGFjay5wb3AoKTtcbiAgICBiU3RhY2sucG9wKCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBQZXJmb3JtIGEgZGVlcCBjb21wYXJpc29uIHRvIGNoZWNrIGlmIHR3byBvYmplY3RzIGFyZSBlcXVhbC5cbiAgXy5pc0VxdWFsID0gZnVuY3Rpb24oYSwgYikge1xuICAgIHJldHVybiBlcShhLCBiLCBbXSwgW10pO1xuICB9O1xuXG4gIC8vIElzIGEgZ2l2ZW4gYXJyYXksIHN0cmluZywgb3Igb2JqZWN0IGVtcHR5P1xuICAvLyBBbiBcImVtcHR5XCIgb2JqZWN0IGhhcyBubyBlbnVtZXJhYmxlIG93bi1wcm9wZXJ0aWVzLlxuICBfLmlzRW1wdHkgPSBmdW5jdGlvbihvYmopIHtcbiAgICBpZiAob2JqID09IG51bGwpIHJldHVybiB0cnVlO1xuICAgIGlmIChfLmlzQXJyYXkob2JqKSB8fCBfLmlzU3RyaW5nKG9iaikpIHJldHVybiBvYmoubGVuZ3RoID09PSAwO1xuICAgIGZvciAodmFyIGtleSBpbiBvYmopIGlmIChfLmhhcyhvYmosIGtleSkpIHJldHVybiBmYWxzZTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcblxuICAvLyBJcyBhIGdpdmVuIHZhbHVlIGEgRE9NIGVsZW1lbnQ/XG4gIF8uaXNFbGVtZW50ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuICEhKG9iaiAmJiBvYmoubm9kZVR5cGUgPT09IDEpO1xuICB9O1xuXG4gIC8vIElzIGEgZ2l2ZW4gdmFsdWUgYW4gYXJyYXk/XG4gIC8vIERlbGVnYXRlcyB0byBFQ01BNSdzIG5hdGl2ZSBBcnJheS5pc0FycmF5XG4gIF8uaXNBcnJheSA9IG5hdGl2ZUlzQXJyYXkgfHwgZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIHRvU3RyaW5nLmNhbGwob2JqKSA9PSAnW29iamVjdCBBcnJheV0nO1xuICB9O1xuXG4gIC8vIElzIGEgZ2l2ZW4gdmFyaWFibGUgYW4gb2JqZWN0P1xuICBfLmlzT2JqZWN0ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIG9iaiA9PT0gT2JqZWN0KG9iaik7XG4gIH07XG5cbiAgLy8gQWRkIHNvbWUgaXNUeXBlIG1ldGhvZHM6IGlzQXJndW1lbnRzLCBpc0Z1bmN0aW9uLCBpc1N0cmluZywgaXNOdW1iZXIsIGlzRGF0ZSwgaXNSZWdFeHAuXG4gIGVhY2goWydBcmd1bWVudHMnLCAnRnVuY3Rpb24nLCAnU3RyaW5nJywgJ051bWJlcicsICdEYXRlJywgJ1JlZ0V4cCddLCBmdW5jdGlvbihuYW1lKSB7XG4gICAgX1snaXMnICsgbmFtZV0gPSBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiB0b1N0cmluZy5jYWxsKG9iaikgPT0gJ1tvYmplY3QgJyArIG5hbWUgKyAnXSc7XG4gICAgfTtcbiAgfSk7XG5cbiAgLy8gRGVmaW5lIGEgZmFsbGJhY2sgdmVyc2lvbiBvZiB0aGUgbWV0aG9kIGluIGJyb3dzZXJzIChhaGVtLCBJRSksIHdoZXJlXG4gIC8vIHRoZXJlIGlzbid0IGFueSBpbnNwZWN0YWJsZSBcIkFyZ3VtZW50c1wiIHR5cGUuXG4gIGlmICghXy5pc0FyZ3VtZW50cyhhcmd1bWVudHMpKSB7XG4gICAgXy5pc0FyZ3VtZW50cyA9IGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuICEhKG9iaiAmJiBfLmhhcyhvYmosICdjYWxsZWUnKSk7XG4gICAgfTtcbiAgfVxuXG4gIC8vIE9wdGltaXplIGBpc0Z1bmN0aW9uYCBpZiBhcHByb3ByaWF0ZS5cbiAgaWYgKHR5cGVvZiAoLy4vKSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIF8uaXNGdW5jdGlvbiA9IGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuIHR5cGVvZiBvYmogPT09ICdmdW5jdGlvbic7XG4gICAgfTtcbiAgfVxuXG4gIC8vIElzIGEgZ2l2ZW4gb2JqZWN0IGEgZmluaXRlIG51bWJlcj9cbiAgXy5pc0Zpbml0ZSA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiBpc0Zpbml0ZShvYmopICYmICFpc05hTihwYXJzZUZsb2F0KG9iaikpO1xuICB9O1xuXG4gIC8vIElzIHRoZSBnaXZlbiB2YWx1ZSBgTmFOYD8gKE5hTiBpcyB0aGUgb25seSBudW1iZXIgd2hpY2ggZG9lcyBub3QgZXF1YWwgaXRzZWxmKS5cbiAgXy5pc05hTiA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiBfLmlzTnVtYmVyKG9iaikgJiYgb2JqICE9ICtvYmo7XG4gIH07XG5cbiAgLy8gSXMgYSBnaXZlbiB2YWx1ZSBhIGJvb2xlYW4/XG4gIF8uaXNCb29sZWFuID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIG9iaiA9PT0gdHJ1ZSB8fCBvYmogPT09IGZhbHNlIHx8IHRvU3RyaW5nLmNhbGwob2JqKSA9PSAnW29iamVjdCBCb29sZWFuXSc7XG4gIH07XG5cbiAgLy8gSXMgYSBnaXZlbiB2YWx1ZSBlcXVhbCB0byBudWxsP1xuICBfLmlzTnVsbCA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiBvYmogPT09IG51bGw7XG4gIH07XG5cbiAgLy8gSXMgYSBnaXZlbiB2YXJpYWJsZSB1bmRlZmluZWQ/XG4gIF8uaXNVbmRlZmluZWQgPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gb2JqID09PSB2b2lkIDA7XG4gIH07XG5cbiAgLy8gU2hvcnRjdXQgZnVuY3Rpb24gZm9yIGNoZWNraW5nIGlmIGFuIG9iamVjdCBoYXMgYSBnaXZlbiBwcm9wZXJ0eSBkaXJlY3RseVxuICAvLyBvbiBpdHNlbGYgKGluIG90aGVyIHdvcmRzLCBub3Qgb24gYSBwcm90b3R5cGUpLlxuICBfLmhhcyA9IGZ1bmN0aW9uKG9iaiwga2V5KSB7XG4gICAgcmV0dXJuIGhhc093blByb3BlcnR5LmNhbGwob2JqLCBrZXkpO1xuICB9O1xuXG4gIC8vIFV0aWxpdHkgRnVuY3Rpb25zXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gUnVuIFVuZGVyc2NvcmUuanMgaW4gKm5vQ29uZmxpY3QqIG1vZGUsIHJldHVybmluZyB0aGUgYF9gIHZhcmlhYmxlIHRvIGl0c1xuICAvLyBwcmV2aW91cyBvd25lci4gUmV0dXJucyBhIHJlZmVyZW5jZSB0byB0aGUgVW5kZXJzY29yZSBvYmplY3QuXG4gIF8ubm9Db25mbGljdCA9IGZ1bmN0aW9uKCkge1xuICAgIHJvb3QuXyA9IHByZXZpb3VzVW5kZXJzY29yZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICAvLyBLZWVwIHRoZSBpZGVudGl0eSBmdW5jdGlvbiBhcm91bmQgZm9yIGRlZmF1bHQgaXRlcmF0b3JzLlxuICBfLmlkZW50aXR5ID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH07XG5cbiAgLy8gUnVuIGEgZnVuY3Rpb24gKipuKiogdGltZXMuXG4gIF8udGltZXMgPSBmdW5jdGlvbihuLCBpdGVyYXRvciwgY29udGV4dCkge1xuICAgIHZhciBhY2N1bSA9IEFycmF5KG4pO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbjsgaSsrKSBhY2N1bVtpXSA9IGl0ZXJhdG9yLmNhbGwoY29udGV4dCwgaSk7XG4gICAgcmV0dXJuIGFjY3VtO1xuICB9O1xuXG4gIC8vIFJldHVybiBhIHJhbmRvbSBpbnRlZ2VyIGJldHdlZW4gbWluIGFuZCBtYXggKGluY2x1c2l2ZSkuXG4gIF8ucmFuZG9tID0gZnVuY3Rpb24obWluLCBtYXgpIHtcbiAgICBpZiAobWF4ID09IG51bGwpIHtcbiAgICAgIG1heCA9IG1pbjtcbiAgICAgIG1pbiA9IDA7XG4gICAgfVxuICAgIHJldHVybiBtaW4gKyBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluICsgMSkpO1xuICB9O1xuXG4gIC8vIExpc3Qgb2YgSFRNTCBlbnRpdGllcyBmb3IgZXNjYXBpbmcuXG4gIHZhciBlbnRpdHlNYXAgPSB7XG4gICAgZXNjYXBlOiB7XG4gICAgICAnJic6ICcmYW1wOycsXG4gICAgICAnPCc6ICcmbHQ7JyxcbiAgICAgICc+JzogJyZndDsnLFxuICAgICAgJ1wiJzogJyZxdW90OycsXG4gICAgICBcIidcIjogJyYjeDI3OycsXG4gICAgICAnLyc6ICcmI3gyRjsnXG4gICAgfVxuICB9O1xuICBlbnRpdHlNYXAudW5lc2NhcGUgPSBfLmludmVydChlbnRpdHlNYXAuZXNjYXBlKTtcblxuICAvLyBSZWdleGVzIGNvbnRhaW5pbmcgdGhlIGtleXMgYW5kIHZhbHVlcyBsaXN0ZWQgaW1tZWRpYXRlbHkgYWJvdmUuXG4gIHZhciBlbnRpdHlSZWdleGVzID0ge1xuICAgIGVzY2FwZTogICBuZXcgUmVnRXhwKCdbJyArIF8ua2V5cyhlbnRpdHlNYXAuZXNjYXBlKS5qb2luKCcnKSArICddJywgJ2cnKSxcbiAgICB1bmVzY2FwZTogbmV3IFJlZ0V4cCgnKCcgKyBfLmtleXMoZW50aXR5TWFwLnVuZXNjYXBlKS5qb2luKCd8JykgKyAnKScsICdnJylcbiAgfTtcblxuICAvLyBGdW5jdGlvbnMgZm9yIGVzY2FwaW5nIGFuZCB1bmVzY2FwaW5nIHN0cmluZ3MgdG8vZnJvbSBIVE1MIGludGVycG9sYXRpb24uXG4gIF8uZWFjaChbJ2VzY2FwZScsICd1bmVzY2FwZSddLCBmdW5jdGlvbihtZXRob2QpIHtcbiAgICBfW21ldGhvZF0gPSBmdW5jdGlvbihzdHJpbmcpIHtcbiAgICAgIGlmIChzdHJpbmcgPT0gbnVsbCkgcmV0dXJuICcnO1xuICAgICAgcmV0dXJuICgnJyArIHN0cmluZykucmVwbGFjZShlbnRpdHlSZWdleGVzW21ldGhvZF0sIGZ1bmN0aW9uKG1hdGNoKSB7XG4gICAgICAgIHJldHVybiBlbnRpdHlNYXBbbWV0aG9kXVttYXRjaF07XG4gICAgICB9KTtcbiAgICB9O1xuICB9KTtcblxuICAvLyBJZiB0aGUgdmFsdWUgb2YgdGhlIG5hbWVkIHByb3BlcnR5IGlzIGEgZnVuY3Rpb24gdGhlbiBpbnZva2UgaXQ7XG4gIC8vIG90aGVyd2lzZSwgcmV0dXJuIGl0LlxuICBfLnJlc3VsdCA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHtcbiAgICBpZiAob2JqZWN0ID09IG51bGwpIHJldHVybiBudWxsO1xuICAgIHZhciB2YWx1ZSA9IG9iamVjdFtwcm9wZXJ0eV07XG4gICAgcmV0dXJuIF8uaXNGdW5jdGlvbih2YWx1ZSkgPyB2YWx1ZS5jYWxsKG9iamVjdCkgOiB2YWx1ZTtcbiAgfTtcblxuICAvLyBBZGQgeW91ciBvd24gY3VzdG9tIGZ1bmN0aW9ucyB0byB0aGUgVW5kZXJzY29yZSBvYmplY3QuXG4gIF8ubWl4aW4gPSBmdW5jdGlvbihvYmopIHtcbiAgICBlYWNoKF8uZnVuY3Rpb25zKG9iaiksIGZ1bmN0aW9uKG5hbWUpe1xuICAgICAgdmFyIGZ1bmMgPSBfW25hbWVdID0gb2JqW25hbWVdO1xuICAgICAgXy5wcm90b3R5cGVbbmFtZV0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGFyZ3MgPSBbdGhpcy5fd3JhcHBlZF07XG4gICAgICAgIHB1c2guYXBwbHkoYXJncywgYXJndW1lbnRzKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdC5jYWxsKHRoaXMsIGZ1bmMuYXBwbHkoXywgYXJncykpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgfTtcblxuICAvLyBHZW5lcmF0ZSBhIHVuaXF1ZSBpbnRlZ2VyIGlkICh1bmlxdWUgd2l0aGluIHRoZSBlbnRpcmUgY2xpZW50IHNlc3Npb24pLlxuICAvLyBVc2VmdWwgZm9yIHRlbXBvcmFyeSBET00gaWRzLlxuICB2YXIgaWRDb3VudGVyID0gMDtcbiAgXy51bmlxdWVJZCA9IGZ1bmN0aW9uKHByZWZpeCkge1xuICAgIHZhciBpZCA9ICsraWRDb3VudGVyICsgJyc7XG4gICAgcmV0dXJuIHByZWZpeCA/IHByZWZpeCArIGlkIDogaWQ7XG4gIH07XG5cbiAgLy8gQnkgZGVmYXVsdCwgVW5kZXJzY29yZSB1c2VzIEVSQi1zdHlsZSB0ZW1wbGF0ZSBkZWxpbWl0ZXJzLCBjaGFuZ2UgdGhlXG4gIC8vIGZvbGxvd2luZyB0ZW1wbGF0ZSBzZXR0aW5ncyB0byB1c2UgYWx0ZXJuYXRpdmUgZGVsaW1pdGVycy5cbiAgXy50ZW1wbGF0ZVNldHRpbmdzID0ge1xuICAgIGV2YWx1YXRlICAgIDogLzwlKFtcXHNcXFNdKz8pJT4vZyxcbiAgICBpbnRlcnBvbGF0ZSA6IC88JT0oW1xcc1xcU10rPyklPi9nLFxuICAgIGVzY2FwZSAgICAgIDogLzwlLShbXFxzXFxTXSs/KSU+L2dcbiAgfTtcblxuICAvLyBXaGVuIGN1c3RvbWl6aW5nIGB0ZW1wbGF0ZVNldHRpbmdzYCwgaWYgeW91IGRvbid0IHdhbnQgdG8gZGVmaW5lIGFuXG4gIC8vIGludGVycG9sYXRpb24sIGV2YWx1YXRpb24gb3IgZXNjYXBpbmcgcmVnZXgsIHdlIG5lZWQgb25lIHRoYXQgaXNcbiAgLy8gZ3VhcmFudGVlZCBub3QgdG8gbWF0Y2guXG4gIHZhciBub01hdGNoID0gLyguKV4vO1xuXG4gIC8vIENlcnRhaW4gY2hhcmFjdGVycyBuZWVkIHRvIGJlIGVzY2FwZWQgc28gdGhhdCB0aGV5IGNhbiBiZSBwdXQgaW50byBhXG4gIC8vIHN0cmluZyBsaXRlcmFsLlxuICB2YXIgZXNjYXBlcyA9IHtcbiAgICBcIidcIjogICAgICBcIidcIixcbiAgICAnXFxcXCc6ICAgICAnXFxcXCcsXG4gICAgJ1xccic6ICAgICAncicsXG4gICAgJ1xcbic6ICAgICAnbicsXG4gICAgJ1xcdCc6ICAgICAndCcsXG4gICAgJ1xcdTIwMjgnOiAndTIwMjgnLFxuICAgICdcXHUyMDI5JzogJ3UyMDI5J1xuICB9O1xuXG4gIHZhciBlc2NhcGVyID0gL1xcXFx8J3xcXHJ8XFxufFxcdHxcXHUyMDI4fFxcdTIwMjkvZztcblxuICAvLyBKYXZhU2NyaXB0IG1pY3JvLXRlbXBsYXRpbmcsIHNpbWlsYXIgdG8gSm9obiBSZXNpZydzIGltcGxlbWVudGF0aW9uLlxuICAvLyBVbmRlcnNjb3JlIHRlbXBsYXRpbmcgaGFuZGxlcyBhcmJpdHJhcnkgZGVsaW1pdGVycywgcHJlc2VydmVzIHdoaXRlc3BhY2UsXG4gIC8vIGFuZCBjb3JyZWN0bHkgZXNjYXBlcyBxdW90ZXMgd2l0aGluIGludGVycG9sYXRlZCBjb2RlLlxuICBfLnRlbXBsYXRlID0gZnVuY3Rpb24odGV4dCwgZGF0YSwgc2V0dGluZ3MpIHtcbiAgICB2YXIgcmVuZGVyO1xuICAgIHNldHRpbmdzID0gXy5kZWZhdWx0cyh7fSwgc2V0dGluZ3MsIF8udGVtcGxhdGVTZXR0aW5ncyk7XG5cbiAgICAvLyBDb21iaW5lIGRlbGltaXRlcnMgaW50byBvbmUgcmVndWxhciBleHByZXNzaW9uIHZpYSBhbHRlcm5hdGlvbi5cbiAgICB2YXIgbWF0Y2hlciA9IG5ldyBSZWdFeHAoW1xuICAgICAgKHNldHRpbmdzLmVzY2FwZSB8fCBub01hdGNoKS5zb3VyY2UsXG4gICAgICAoc2V0dGluZ3MuaW50ZXJwb2xhdGUgfHwgbm9NYXRjaCkuc291cmNlLFxuICAgICAgKHNldHRpbmdzLmV2YWx1YXRlIHx8IG5vTWF0Y2gpLnNvdXJjZVxuICAgIF0uam9pbignfCcpICsgJ3wkJywgJ2cnKTtcblxuICAgIC8vIENvbXBpbGUgdGhlIHRlbXBsYXRlIHNvdXJjZSwgZXNjYXBpbmcgc3RyaW5nIGxpdGVyYWxzIGFwcHJvcHJpYXRlbHkuXG4gICAgdmFyIGluZGV4ID0gMDtcbiAgICB2YXIgc291cmNlID0gXCJfX3ArPSdcIjtcbiAgICB0ZXh0LnJlcGxhY2UobWF0Y2hlciwgZnVuY3Rpb24obWF0Y2gsIGVzY2FwZSwgaW50ZXJwb2xhdGUsIGV2YWx1YXRlLCBvZmZzZXQpIHtcbiAgICAgIHNvdXJjZSArPSB0ZXh0LnNsaWNlKGluZGV4LCBvZmZzZXQpXG4gICAgICAgIC5yZXBsYWNlKGVzY2FwZXIsIGZ1bmN0aW9uKG1hdGNoKSB7IHJldHVybiAnXFxcXCcgKyBlc2NhcGVzW21hdGNoXTsgfSk7XG5cbiAgICAgIGlmIChlc2NhcGUpIHtcbiAgICAgICAgc291cmNlICs9IFwiJytcXG4oKF9fdD0oXCIgKyBlc2NhcGUgKyBcIikpPT1udWxsPycnOl8uZXNjYXBlKF9fdCkpK1xcbidcIjtcbiAgICAgIH1cbiAgICAgIGlmIChpbnRlcnBvbGF0ZSkge1xuICAgICAgICBzb3VyY2UgKz0gXCInK1xcbigoX190PShcIiArIGludGVycG9sYXRlICsgXCIpKT09bnVsbD8nJzpfX3QpK1xcbidcIjtcbiAgICAgIH1cbiAgICAgIGlmIChldmFsdWF0ZSkge1xuICAgICAgICBzb3VyY2UgKz0gXCInO1xcblwiICsgZXZhbHVhdGUgKyBcIlxcbl9fcCs9J1wiO1xuICAgICAgfVxuICAgICAgaW5kZXggPSBvZmZzZXQgKyBtYXRjaC5sZW5ndGg7XG4gICAgICByZXR1cm4gbWF0Y2g7XG4gICAgfSk7XG4gICAgc291cmNlICs9IFwiJztcXG5cIjtcblxuICAgIC8vIElmIGEgdmFyaWFibGUgaXMgbm90IHNwZWNpZmllZCwgcGxhY2UgZGF0YSB2YWx1ZXMgaW4gbG9jYWwgc2NvcGUuXG4gICAgaWYgKCFzZXR0aW5ncy52YXJpYWJsZSkgc291cmNlID0gJ3dpdGgob2JqfHx7fSl7XFxuJyArIHNvdXJjZSArICd9XFxuJztcblxuICAgIHNvdXJjZSA9IFwidmFyIF9fdCxfX3A9JycsX19qPUFycmF5LnByb3RvdHlwZS5qb2luLFwiICtcbiAgICAgIFwicHJpbnQ9ZnVuY3Rpb24oKXtfX3ArPV9fai5jYWxsKGFyZ3VtZW50cywnJyk7fTtcXG5cIiArXG4gICAgICBzb3VyY2UgKyBcInJldHVybiBfX3A7XFxuXCI7XG5cbiAgICB0cnkge1xuICAgICAgcmVuZGVyID0gbmV3IEZ1bmN0aW9uKHNldHRpbmdzLnZhcmlhYmxlIHx8ICdvYmonLCAnXycsIHNvdXJjZSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgZS5zb3VyY2UgPSBzb3VyY2U7XG4gICAgICB0aHJvdyBlO1xuICAgIH1cblxuICAgIGlmIChkYXRhKSByZXR1cm4gcmVuZGVyKGRhdGEsIF8pO1xuICAgIHZhciB0ZW1wbGF0ZSA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHJldHVybiByZW5kZXIuY2FsbCh0aGlzLCBkYXRhLCBfKTtcbiAgICB9O1xuXG4gICAgLy8gUHJvdmlkZSB0aGUgY29tcGlsZWQgZnVuY3Rpb24gc291cmNlIGFzIGEgY29udmVuaWVuY2UgZm9yIHByZWNvbXBpbGF0aW9uLlxuICAgIHRlbXBsYXRlLnNvdXJjZSA9ICdmdW5jdGlvbignICsgKHNldHRpbmdzLnZhcmlhYmxlIHx8ICdvYmonKSArICcpe1xcbicgKyBzb3VyY2UgKyAnfSc7XG5cbiAgICByZXR1cm4gdGVtcGxhdGU7XG4gIH07XG5cbiAgLy8gQWRkIGEgXCJjaGFpblwiIGZ1bmN0aW9uLCB3aGljaCB3aWxsIGRlbGVnYXRlIHRvIHRoZSB3cmFwcGVyLlxuICBfLmNoYWluID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIF8ob2JqKS5jaGFpbigpO1xuICB9O1xuXG4gIC8vIE9PUFxuICAvLyAtLS0tLS0tLS0tLS0tLS1cbiAgLy8gSWYgVW5kZXJzY29yZSBpcyBjYWxsZWQgYXMgYSBmdW5jdGlvbiwgaXQgcmV0dXJucyBhIHdyYXBwZWQgb2JqZWN0IHRoYXRcbiAgLy8gY2FuIGJlIHVzZWQgT08tc3R5bGUuIFRoaXMgd3JhcHBlciBob2xkcyBhbHRlcmVkIHZlcnNpb25zIG9mIGFsbCB0aGVcbiAgLy8gdW5kZXJzY29yZSBmdW5jdGlvbnMuIFdyYXBwZWQgb2JqZWN0cyBtYXkgYmUgY2hhaW5lZC5cblxuICAvLyBIZWxwZXIgZnVuY3Rpb24gdG8gY29udGludWUgY2hhaW5pbmcgaW50ZXJtZWRpYXRlIHJlc3VsdHMuXG4gIHZhciByZXN1bHQgPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gdGhpcy5fY2hhaW4gPyBfKG9iaikuY2hhaW4oKSA6IG9iajtcbiAgfTtcblxuICAvLyBBZGQgYWxsIG9mIHRoZSBVbmRlcnNjb3JlIGZ1bmN0aW9ucyB0byB0aGUgd3JhcHBlciBvYmplY3QuXG4gIF8ubWl4aW4oXyk7XG5cbiAgLy8gQWRkIGFsbCBtdXRhdG9yIEFycmF5IGZ1bmN0aW9ucyB0byB0aGUgd3JhcHBlci5cbiAgZWFjaChbJ3BvcCcsICdwdXNoJywgJ3JldmVyc2UnLCAnc2hpZnQnLCAnc29ydCcsICdzcGxpY2UnLCAndW5zaGlmdCddLCBmdW5jdGlvbihuYW1lKSB7XG4gICAgdmFyIG1ldGhvZCA9IEFycmF5UHJvdG9bbmFtZV07XG4gICAgXy5wcm90b3R5cGVbbmFtZV0gPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBvYmogPSB0aGlzLl93cmFwcGVkO1xuICAgICAgbWV0aG9kLmFwcGx5KG9iaiwgYXJndW1lbnRzKTtcbiAgICAgIGlmICgobmFtZSA9PSAnc2hpZnQnIHx8IG5hbWUgPT0gJ3NwbGljZScpICYmIG9iai5sZW5ndGggPT09IDApIGRlbGV0ZSBvYmpbMF07XG4gICAgICByZXR1cm4gcmVzdWx0LmNhbGwodGhpcywgb2JqKTtcbiAgICB9O1xuICB9KTtcblxuICAvLyBBZGQgYWxsIGFjY2Vzc29yIEFycmF5IGZ1bmN0aW9ucyB0byB0aGUgd3JhcHBlci5cbiAgZWFjaChbJ2NvbmNhdCcsICdqb2luJywgJ3NsaWNlJ10sIGZ1bmN0aW9uKG5hbWUpIHtcbiAgICB2YXIgbWV0aG9kID0gQXJyYXlQcm90b1tuYW1lXTtcbiAgICBfLnByb3RvdHlwZVtuYW1lXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHJlc3VsdC5jYWxsKHRoaXMsIG1ldGhvZC5hcHBseSh0aGlzLl93cmFwcGVkLCBhcmd1bWVudHMpKTtcbiAgICB9O1xuICB9KTtcblxuICBfLmV4dGVuZChfLnByb3RvdHlwZSwge1xuXG4gICAgLy8gU3RhcnQgY2hhaW5pbmcgYSB3cmFwcGVkIFVuZGVyc2NvcmUgb2JqZWN0LlxuICAgIGNoYWluOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuX2NoYWluID0gdHJ1ZTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICAvLyBFeHRyYWN0cyB0aGUgcmVzdWx0IGZyb20gYSB3cmFwcGVkIGFuZCBjaGFpbmVkIG9iamVjdC5cbiAgICB2YWx1ZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5fd3JhcHBlZDtcbiAgICB9XG5cbiAgfSk7XG5cbn0pLmNhbGwodGhpcyk7XG4iXX0=
;
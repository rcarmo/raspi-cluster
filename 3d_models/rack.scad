/*
 * A mounting platform for a "rack" of 5 Raspberry Pi boards
 */

rca_pos = [46.5,11,0];
audio_pos = [65,10,0];

// Used to build dovetails, if you want
snap1_pos = [5,-3,0];
snap2_pos = [70,-3,0];

module base() {
    // carve out a base cube to provide two support ridges:
    // one for the board and another place to hold an expansion board

	difference(){
  		difference(){
  			cube([85.6,25.0,7]);
			translate([0,2,3])
				cube([90,14,5]);
		}
		translate([0,18,3])
			cube([90,12,5]);
	}
}

module load_bearing() {
    // these will surround the RCA and audio jacks and provide some rigidity

	union() {
		base();
		translate(rca_pos)
			cylinder(h = 7, r = 5.5, center = false
);
		translate(rca_pos - [1,10,0])
			cube([2,16,7], center = false);

		translate(audio_pos)
			cylinder(h = 7, r = 4.5, center = false);

		translate(audio_pos - [1,9,0])
			cube([2,13,7], center = false);

		translate(audio_pos + [-1,2,0])
			cube([2,5,7], center = false);
	}
}


module holes() {
    // punch out all the holes at once

	union() {
		translate(rca_pos)
			cylinder(h = 9, r = 4.4, center = false);
		translate(audio_pos)
			cylinder(h = 9, r = 3.6, center = false);
	}

    // not going to use the dovetails
/*
	translate([0,22,0])
		union() {
			translate(snap1_pos)
				scale([1.1,1.1,1])
					triangle();
			translate(snap2_pos)
				scale([1.1,1.1,1])
					triangle();
		}
*/
}


module triangle (side=10, height=3, center=false) {
    // base triangle for dovetails

	translate(center==true ? [-side/2,-sqrt(3)*side/6,-height/2] : [0,0,0])	
		linear_extrude(height=height)
			polygon(points=[[0,0],[side,0],[side/2,sqrt(3)*side/2]]);
}


module dovetails() {
	union() {
		translate(snap1_pos)
			triangle();
		translate(snap2_pos)
			triangle();
	}
}

module single(){
union() {
   // dovetails();
	difference() {
		load_bearing();
		holes();
	}
}
}

// make 5 in a row
for(y = [0,25,50,75,100]) {
	translate([0,y,0])
		single();
}



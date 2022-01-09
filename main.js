var display = document.getElementById("display");
var g = display.getContext("2d");

var basicTriangle;
var basicSquare;
var camera;
var transform

var rc;

var mat;

function init()
{
	mat = appendMaterial(new Material_HSL(205/360, 70/100, 68/100));

	var square = new MeshData(
		[//vertices
			-1.0, 1.0, 0.0,
			1.0, 1.0, 0.0,
			-1.0, -1.0, 0.0,
			1.0, -1.0, 0.0
		],
		[//indices
			0, 1, 2,
			1, 3, 2
		],
		[//normals
			0.0, 0.0, 1.0,
			0.0, 0.0, 1.0
		],
		[//material ids
			mat,
			mat
		]
	);

	basicSquare = appendMeshData(square);

	camera = MatrixUtils.getIdentity();

	transform = new TransformData();

	transform.position.x = 1;
	transform.position.y = 3;
	transform.position.z = 5;

	transform.scale.x = 2;
	transform.scale.y = 4;
	transform.scale.z = 8;

	transform.updateMatrix(false);
}

function render()
{
	rc = new RenderCache();

	appendGameObject(rc, basicSquare, transform, camera);
	appendGameObject(rc, basicSquare, transform, camera);
}

init();
render();
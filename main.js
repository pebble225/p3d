var display = document.getElementById("display");
var g = display.getContext("2d");

var basicTriangle;
var basicSquare;
var camera;
var transform, transform2;

var rc;

function init()
{
	var md = new MeshData(
		[
			-1.0, -1.0, 0.0,
			0.0, 1.0, 0.0,
			1.0, -1.0, 0.0
		],
		[
			0, 1, 2
		],
		[
			0.0, 0.0, 1.0
		]
	);

	var square = new MeshData(
		[
			-1.0, 1.0, 0.0,
			1.0, 1.0, 0.0,
			-1.0, -1.0, 0.0,
			1.0, -1.0, 0.0
		],
		[
			0, 1, 2,
			1, 3, 2
		],
		[
			0.0, 0.0, 1.0,
			0.0, 0.0, 1.0
		],
		[
			255, 0, 0,
			0, 255, 0
		]
	);

	basicTriangle = appendMeshData(md);
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

	transform2 = new TransformData();

	transform2.position.x = 2;
	transform2.position.y = 4;
	transform2.position.z = 6;

	transform2.scale.x = 4;
	transform2.scale.y = 5;
	transform2.scale.z = 6;

	transform2.updateMatrix(false);
}

function render()
{
	rc = new RenderCache();

	appendGameObject(rc, basicSquare, transform, camera);
	appendGameObject(rc, basicSquare, transform2, camera);
}

init();
render();
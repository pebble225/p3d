var display = document.getElementById("display");
var g = display.getContext("2d");

var basicTriangle;
var basicSquare;
var camera;
var transform;

var perspectiveMatrix;

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

	perspectiveMatrix = MatrixUtils.getIdentity();
	perspectiveMatrix = MatrixUtils.matmult(perspectiveMatrix, MatrixUtils.getPerspective(100));

	transform = new TransformData();

	transform.position.x = 0;
	transform.position.y = 0;
	transform.position.z = -2;

	transform.updateMatrix(false);
}

function render()
{
	rc = new RenderCache();

	appendGameObject(rc, basicSquare, transform, camera);

	transform.position.z = -3;
	transform.position.x = 0.5;

	transform.updateMatrix(false);

	appendGameObject(rc, basicSquare, transform, camera);

	prepareFrame(rc, perspectiveMatrix);
}

init();
render();
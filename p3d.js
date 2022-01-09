var MatrixUtils = {
	getIdentity: function()
	{
		return [
			1.0, 0.0, 0.0, 0.0,
			0.0, 1.0, 0.0, 0.0,
			0.0, 0.0, 1.0, 0.0,
			0.0, 0.0, 0.0, 1.0
		];
	},
	getTranslate: function(x, y, z)
	{
		return [
			1.0, 0.0, 0.0, x,
			0.0, 1.0, 0.0, y,
			0.0, 0.0, 1.0, z,
			0.0, 0.0, 0.0, 1.0
		];
	},
	getRotationX: function(r)
	{
		return [
			1.0, 0.0, 0.0, 0.0,
			0.0, Math.cos(r), -Math.sin(r), 0.0,
			0.0, Math.sin(r), Math.cos(r), 0.0,
			0.0, 0.0, 0.0, 1.0
		];
	},
	getRotationY: function(r)
	{
		return [
			Math.cos(r), 0.0, Math.sin(r), 0.0,
			0.0, 1.0, 0.0, 0.0,
			-Math.sin(r), 0.0, Math.cos(r), 0.0,
			0.0, 0.0, 0.0, 1.0
		];
	},
	getRotationZ: function(r)
	{
		return [
			Math.cos(r), -Math.sin(r), 0.0, 0.0,
			Math.sin(r), Math.cos(r), 0.0, 0.0,
			0.0, 0.0, 1.0, 0.0,
			0.0, 0.0, 0.0, 1.0
		];
	},
	getScale: function(x, y, z)
	{
		return [
			x, 0.0, 0.0, 0.0,
			0.0, y, 0.0, 0.0,
			0.0, 0.0, z, 0.0,
			0.0, 0.0, 0.0, 1.0
		];
	},
	getPerspective: function(fov)
	{
		return [
			1/Math.tan(fov/2), 0.0, 0.0, 0.0,
			0.0, 1/Math.tan(fov/2), 0.0, 0.0,
			0.0, 0.0, 1.0, 0.0,
			0.0, 0.0, -1.0, 1.0
		];
	},
	matmult: function(a, b)
	{
		var m = Array(16);

		for (var z = 0; z < 4; z++)
		{
			for (var y = 0; y < 4; y++)
			{
				var sum = 0;

				for (var x = 0; x < 4; x++)
				{
					sum += a[4 * z + x] * b[4 * x + y];
				}

				m[4 * z + y] = sum;
			}
		}

		return m;
	},
	vertmult: function(vec, mat)//I will manually add in a fourth element, but this is a workaround. The function will take in a vec3 and return a vec4
	{
		var vec2 = [vec[0], vec[1], vec[2], 1];

		var out = Array(4);

		for (var y = 0; y < 4; y++)
		{
			var sum = 0;
			
			for (var x = 0; x < 4; x++)
			{
				sum += vec2[x] * mat[4 * x + y];
			}

			out[y] = sum;
		}

		return out;
	},
	display: function(m)
	{
		for (var y = 0; y < 4; y++)
		{
			console.log(m[4 * y + 0] + " " + m[4 * y + 1] + " " + m[4 * y + 2] + " " + m[4 * y + 3]);
		}
	}
};

function Material_HSL(h,s,l)//g.fillStyle = "hsl(H,S%,L%)";
{
	this.h = h;
	this.s = s;
	this.l = l;
}

function appendIndex(arr, element)
{
	var i = arr.length;
	arr.push(element);
	return i;
}

function RenderCache()
{//						for every triangle that is added, the following ratio should be observed:
	this.vertices = [];//3 vertices
	this.normals = [];//1 normal
	this.triangles = [];//1 TriangleData Object
	
	this.sortedTriangles = [];//1 pointer
	this.renderedTriangles = [];//1 2D triangle
}

var global_meshDatabank = [];
var global_materialDatabank = [];

function MeshData(vertices, indices, normals, materials)
{//						for every triangle that is added, the following ratio should be observed:
	this.vertices = vertices;//3 vertices(9 floats)
	this.indices = indices;//1 index(3 integers)
	this.normals = normals;//1 normal(3 floats)
	this.materials = materials;//1 material pointer(1 integer)
}

function TriangleData(vertices, normals, mesh)//maybe it's a bad idea to have an abstraction for this too :/
{
	//all of the values stored here should be pointers
	this.vertices = vertices;
	this.normals = normals;
	this.mesh = mesh;
}

function appendMeshData(m)
{
	return appendIndex(global_meshDatabank, m);
}

function appendMaterial(m)
{
	return appendIndex(global_materialDatabank, m);
}

/**
 * 
 * @param {RenderCache} rc This is a Render Cache that must be declared ahead of time in order to begin appending data to be rendered in the frame.
 * @param {Number} mesh This a pointer to the mesh stored in `global_meshDatabank` that will be used to render this GameObject.
 * @param {TransformData} td This is not a pointer. It is the data that will be used to adjust the mesh to fit the game object.
 * @param {Array[16]} camera This is the transform matrix for the camera. For no camera, store an Identity Matrix and pass it in.
 */

function appendGameObject(rc, mesh, td, camera)
{
	//multiply the Object Transform with the Camera Transform
	var transformMatrix = MatrixUtils.matmult(td.m, camera);

	//initialize an array for a pointer array to transformed vertices
	var vertices_p = [];//vertex pointers will come in sets of three
	//the indices (i.e. EBO) will treat vertices_p as if they are the vertices, but when retrieving the vertices, the triangle will use the pointer to find the correct pointer in vertices_p in order retrieve the vertex data stored in rc.vertices

	var normals_p = [];

	for (var i = 0; i < global_meshDatabank[mesh].vertices.length; i += 3)
	{
		//vertex is bundled into a group of three in order to multiply with the matrix
		var vertex = [global_meshDatabank[mesh].vertices[i], global_meshDatabank[mesh].vertices[i + 1], global_meshDatabank[mesh].vertices[i + 2]];
		
		vertex = MatrixUtils.vertmult(vertex, transformMatrix);

		//vertex is then decoupled in order to store the vertex data in rc and retrieve the pointer to store in vertices_p
		vertices_p.push(appendIndex(rc.vertices, vertex[0]));
		vertices_p.push(appendIndex(rc.vertices, vertex[1]));
		vertices_p.push(appendIndex(rc.vertices, vertex[2]));

		//all of the vertices have been transformed to their correct positions relative to the camera and stored in rc.vertices
	}

	if (global_meshDatabank[mesh].normals != undefined)
	{
		for (var i = 0; i < global_meshDatabank[mesh].normals.length; i += 3)
		{
			var normal = [global_meshDatabank[mesh].normals[i], global_meshDatabank[mesh].normals[i + 1], global_meshDatabank[mesh].normals[i + 2]];

			normal = MatrixUtils.vertmult(normal, td.nm);

			normals_p.push(appendIndex(rc.normals, normal[0]));//same thing that's happening with the vertices is happening here
			normals_p.push(appendIndex(rc.normals, normal[1]));
			normals_p.push(appendIndex(rc.normals, normal[2]));
		}
	}

	for (var i = 0; i < global_meshDatabank[mesh].indices.length; i += 3)
	{
		//triangles are defined as three vertices. The indices will be used as a guide in order to create the triangles
		//for every set of three values for the index, there will/should be a corresponding set of three values for a normal
		//THEREFORE indices and normals should always be the same length

		var triangleVertices_p = [
			vertices_p[global_meshDatabank[mesh].indices[i]],
			vertices_p[global_meshDatabank[mesh].indices[i + 1]],
			vertices_p[global_meshDatabank[mesh].indices[i + 2]]
		];

		/*
		
		The idea in order to make this run efficiently is that there should always only be one instance of each vertex and triangle of a mesh.
		In order to accomplish this, all of the vertices are processed front to back. This creates complications when tryng to define the triangles
		so this is the current workaround.

		Once a vertex is processed and stored, it intentionally leaves behind a footprint. This footprint is stored in vertices_p.
		The triangle can find this exact footprint using the
		indices(or EBO). First it retreives the footprint's location using mesh.indices[i + x], then it navigates through a list of footprints
		to find the right one. Now the triangle knows where to find the vertex in the vc when it needs to do further processing.

		This avoids duplicate vertex processing and ensures that vertices are stored in a single place without fear of any memory leak. I mistrust garbage collection.

		*/

		var triangleNormals_p = [
			normals_p[i],
			normals_p[i + 1],
			normals_p[i + 2]
		];
		
		/*
		
		Normals have no relation to vertices in this situation. They do not need to access any index. Normals describe the triangle as a whole, therefore they can
		correspond to the indices without any trouble.
		
		*/

		var triangle = new TriangleData(
			triangleVertices_p,
			triangleNormals_p,
			mesh
		);

		rc.triangles.push(triangle);
	}
}

/**
 * This function generates all of the draw information for the frame including the rendering order and list of 2d triangles
 * @param {RenderCache} rc This is the render cache.
 * @param {Array(16)} proj This is the perspective matrix that will be used to generate 3D. Generate and store this ahead of time.
 */

function prepareFrame(rc, proj)
{

}

function TransformData()
{
	this.position = {
		x: 0.0,
		y: 0.0,
		z: 0.0
	};
	
	this.rotation = {
		x: 0.0,
		y: 0.0,
		z: 0.0
	};
	
	this.scale = {
		x: 1.0,
		y: 1.0,
		z: 1.0
	};
	
	this.m = Array(16);

	this.nm = Array(16);
	//this is being rushed in a bit late. Normals need to have a matrix that exclusively rotates them without translating or scaling.
}

/**
 * 
 * @param {boolean} isCamera Specifies whether the mesh being inputted is a camera transform.
 */

TransformData.prototype.updateMatrix = function(isCamera)
{
	if (isCamera == undefined)
	{
		console.error("Please specify if matrix being updated is a camera matrix or not.");
	}

	if (isCamera)
	{
		this.m = MatrixUtils.getIdentity();

		this.m = MatrixUtils.matmult(this.m, MatrixUtils.getTranslate(this.position.x, this.position.y, this.position.z));

		var rx = this.rotation.x * Math.PI / 180;
		var ry = this.rotation.y * Math.PI / 180;
		var rz = this.rotation.z * Math.PI / 180;

		var rm = MatrixUtils.getIdentity();

		rm = MatrixUtils.getRotationX(rx);
		rm = MatrixUtils.matmult(rm, MatrixUtils.getRotationY(ry));
		rm = MatrixUtils.matmult(rm, MatrixUtils.getRotationZ(rz));

		this.m = MatrixUtils.matmult(this.m, rm);

		this.m = MatrixUtils.matmult(this.m, MatrixUtils.getScale(this.scale.x, this.scale.y, this.scale.z));
	}
	else
	{
		this.m = MatrixUtils.getIdentity();
		this.nm = MatrixUtils.getIdentity();

		this.m = MatrixUtils.matmult(this.m, MatrixUtils.getTranslate(this.position.x, this.position.y, this.position.z));

		var rx = this.rotation.x * Math.PI / 180;
		var ry = this.rotation.y * Math.PI / 180;
		var rz = this.rotation.z * Math.PI / 180;

		var rm = MatrixUtils.getIdentity();

		rm = MatrixUtils.getRotationY(ry);
		rm = MatrixUtils.matmult(rm, MatrixUtils.getRotationX(rx));
		rm = MatrixUtils.matmult(rm, MatrixUtils.getRotationZ(rz));

		this.m = MatrixUtils.matmult(this.m, rm);
		this.nm = MatrixUtils.matmult(this.nm, rm);

		this.m = MatrixUtils.matmult(this.m, MatrixUtils.getScale(this.scale.x, this.scale.y, this.scale.z));
		
	}
}

# CS452-Project-2
The second project for Computer Graphics

A note on framerate:
Framerate in the current iteration of this project is, quite frankly, terrible.
This is because we only have a single texture buffer! So, twice per frame 
rendered, we generate a GL texture and push it over to the GPU! This is a 
horrifically slow process. 

We could fix this by maintaining an integer that is representative of the object, 
and then just having two texture buffers. The vertex shder could then just pass 
the relevant info off to the fragment shader.

And alternative, and easier method, would have been to store two textures in the 
JS, and then set the texture buffer to a frequently drawn buffer, rather than a 
static draw buffer. We could then just push the relevant texture to this buffer
before rendering each shape. It would not be as fast as the prior idea, due to
the very frequent GPU memory accesses, but it would be leagues faster than what we 
have now. We just ran out of time to test before submission.

## Shapes
We had decided to draw 5 shapes including:
- The Maoi head from Lab 4.
- A sphere
- A cube
- An octahedron
- a tetrahedron

The tetrahedron and cube were textured, and the rest were applied colors through
the colorVector variable. The colors are randomly chosen, and described in the
interaction section. The lighting for the shapes are a directional and point light,
and is implemented with phong shading.

## Animation
The shapes are moving along a rotation of the same amplitude in all three dimensions.
The amplitude is 3 variables named alph1, alph2, and alph3, which are all 0.005*c1,
where c1 is a number controlled by a slider that goes between -5 and 5. This is,
effectively, moving the camera rather than the objects, due to our multiplication
order in the vertex shader (proj * P * M * rotMatX * rotMatY * rotMatZ * vertexPosition).
As a result, you will note that the lighting constant stays to one edge of the objects.

## Interaction
There are two different different ways of interacting with the scene. The first is
randomizing colors by pressing the spacebar. Second, one can increase and decrease
the speed of the objects using the slider that is right below the canvas.
